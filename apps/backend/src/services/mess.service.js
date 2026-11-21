import prisma from "../config/db.js";
import { randomInt, randomBytes } from "node:crypto";

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const CODE_LENGTH = 6;

function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export const generateMessCode = () => {
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i++) {
    const index = randomInt(CHARSET.length);
    code += CHARSET[index];
  }

  return `MESS-${code}`;
};

export async function createMess(mess_name, user_id) {
  return await prisma.$transaction(async (tx) => {
    const mess = await tx.mess.create({
      data: {
        mess_name,
        mess_code: generateMessCode(),
        created_by: user_id,
      },
    });

    await tx.messMembership.create({
      data: {
        user_id,
        mess_id: mess.mess_id,
        role: "ADMIN",
      },
    });

    return mess;
  });
}

export async function getAllMess(user_id) {
  const user = await prisma.user.findUnique({
    where: {
      user_id,
    },
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  const messes = await prisma.messMembership.findMany({
    where: {
      user_id,
    },
    include: {
      mess: true,
    },
  });

  if (messes.length === 0) {
    throw createError("No messes found", 404);
  }

  return messes.map((membership) => ({
    membership_id: membership.membership_id,
    role: membership.role,
    joined_at: membership.joined_at,
    mess_name: membership.mess.mess_name,
    mess_code: membership.mess.mess_code,
  }));
}

export async function getMessById(user_id, mess_id) {
  const user = await prisma.user.findUnique({
    where: {
      user_id,
    },
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
    include: {
      mess: true,
    },
  });

  if (!membership) {
    throw createError("Mess not found", 404);
  }

  return membership;
}

export async function sendInvitation(invitationData) {
  let { user_id, mess_id, invited_email } = invitationData;

  invited_email = invited_email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      user_id,
    },
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  if (user.mail.toLowerCase() === invited_email) {
    throw createError("You cannot invite yourself", 400);
  }

  const mess = await prisma.mess.findUnique({
    where: {
      mess_id,
    },
  });

  if (!mess) {
    throw createError("Mess not found", 404);
  }

  const membership = await prisma.messMembership.findUnique({
    where: {
      user_id_mess_id: {
        user_id,
        mess_id,
      },
    },
  });

  if (!membership) {
    throw createError("You are not a member of this mess", 403);
  }

  if (membership.role !== "ADMIN") {
    throw createError("Only mess admins can send invitations", 403);
  }

  const invitedUser = await prisma.user.findUnique({
    where: {
      mail: invited_email,
    },
  });

  let invitation;
  const expires_at = new Date();
  expires_at.setDate(expires_at.getDate() + 7);

  if (invitedUser) {
    const existingMembership = await prisma.messMembership.findUnique({
      where: {
        user_id_mess_id: {
          user_id: invitedUser.user_id,
          mess_id,
        },
      },
    });

    if (existingMembership) {
      throw createError("User is already a member", 409);
    }

    const existingInvitation = await prisma.messInvitation.findFirst({
      where: {
        mess_id,
        invited_user_id: invitedUser.user_id,
        status: "PENDING",
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw createError("An invitation is already pending", 409);
    }

    invitation = await prisma.messInvitation.create({
      data: {
        mess_id,
        invited_by_id: user_id,
        invited_user_id: invitedUser.user_id,
        invited_email: null,
        expires_at,
      },
    });
  } else {
    const existingInvitation = await prisma.messInvitation.findFirst({
      where: {
        mess_id,
        invited_email: invited_email,
        status: "PENDING",
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      throw createError("An invitation is already pending", 409);
    }

    invitation = await prisma.messInvitation.create({
      data: {
        mess_id,
        invited_by_id: user_id,
        invited_user_id: null,
        invited_email: invited_email,
        expires_at,
      },
    });
  }

  return invitation;
}

export async function getPendingInvitations(user_id) {
  const user = await prisma.user.findUnique({
    where: {
      user_id,
    },
  });

  if (!user) {
    throw createError("User not found", 404);
  }

  const invitations = await prisma.messInvitation.findMany({
    where: {
      invited_user_id: user_id,
      status: "PENDING",
      expires_at: {
        gt: new Date(),
      },
    },
    include: {
      mess: true,
      invited_by: {
        select: {
          user_id: true,
          first_name: true,
          last_name: true,
          mail: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return invitations;
}
