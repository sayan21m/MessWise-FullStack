import {
  createMess,
  getAllMess,
  getMessById,
  sendInvitation,
  getPendingInvitations,
  acceptInvitation,
} from "../services/mess.service.js";

export async function createMessController(req, res) {
  try {
    const user_id = req.user.user_id;
    const { mess_name } = req.body;

    const mess = await createMess(mess_name, user_id);

    return res.status(201).json({
      message: "Mess created successfully",
      data: mess,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

export async function getAllMessController(req, res) {
  try {
    const user_id = req.user.user_id;
    const messes = await getAllMess(user_id);

    return res.status(200).json({
      message: "All messes fetched successfully",
      data: messes,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

export async function getMessByIdController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const mess = await getMessById(user_id, mess_id);

    return res.status(200).json({
      message: "Mess fetched successfully",
      data: mess,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

export async function sendInvitationController(req, res) {
  try {
    const user_id = req.user.user_id;
    const mess_id = req.params.mess_id;
    const invited_email = req.body.invited_email;
    const invitation = await sendInvitation({ user_id, mess_id, invited_email });

    return res.status(201).json({
      message: "Invitation created successfully",
      data: invitation,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

export async function getPendingInvitationsController(req, res) {
  try {
    const user_id = req.user.user_id;
    const invitations = await getPendingInvitations(user_id);

    return res.status(200).json({
      message: "Invitations fetched successfully",
      data: invitations,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Internal server error",
    });
  }
}

export async function acceptInvitationController(req, res) {
  try {
    const user_id = req.user.user_id;
    const { token } = req.body;

    const accepted_invitation = await acceptInvitation(user_id, token);

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: accepted_invitation,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
}
