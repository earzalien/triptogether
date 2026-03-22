import type { RequestHandler } from "express";
import tripRepository from "../trip/tripRepository";
import userRepository from "../user/userRepository";
import invitationRepository from "./invitationRepository";
import resend from "../../libs/resend";

const read: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    const invitation = await invitationRepository.select(invitationId);

    if (!invitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    if (invitation.status === "accepted") {
      res.status(409).json({
        message: "Invitation déjà acceptée",
        trip_id: invitation.trip_id,
      });
      return;
    }

    if (invitation.status === "refused") {
      res.status(410).json({
        message: "Invitation déjà refusée",
      });
      return;
    }

    res.json(invitation);
  } catch (err) {
    next(err);
  }
};

const edit: RequestHandler = async (req, res, next) => {
  try {
    const invitationId = Number(req.params.id);
    const updateInvitation = await invitationRepository.select(invitationId);

    if (Number.isNaN(invitationId)) {
      res.status(400).json({ error: "ID invalide" });
      return;
    }

    if (!updateInvitation) {
      res.status(404).json({ error: "Invitation introuvable" });
      return;
    }

    const success = await invitationRepository.updateStatus(
      invitationId,
      req.body.status,
    );

    if (!success) {
      res.status(500).json({ error: "Erreur mise à jour" });
      return;
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const add: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);
    const { email, message } = req.body;
    const existingUser = await userRepository.findByEmail(email);

    const user_id = existingUser ? existingUser.id : null;

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID du voyage invalide" });
      return;
    }

    if (!email || !message) {
      res.status(400).json({ error: "Email et message requis" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Format email invalide" });
      return;
    }

    const invitationId = await invitationRepository.create(
      tripId,
      email,
      message,
      user_id,
    );

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      throw new Error("CLIENT_URL environment variable is not defined");
    }

    const invitationLink = `${clientUrl}/trip/${tripId}/invitation/${invitationId}`;
    
    const escapeHtml = (unsafe: string) =>
      unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const safeMessage = escapeHtml(typeof message === "string" ? message : String(message ?? ""));

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM as string,
      to: email,
      subject: "Invitation à rejoindre un voyage sur TripTogether",
      html: `
    <p>Bonjour,</p>
    <p>Vous avez reçu une invitation à rejoindre un voyage sur TripTogether.</p>
    <p>Message :</p>
    <blockquote>${safeMessage}</blockquote>
    <p>Pour voir l'invitation et répondre, cliquez sur le lien ci-dessous :</p>
    <p><a href="${invitationLink}">${invitationLink}</a></p>
    <p>À bientôt sur TripTogether !</p>
  `,
    });

    if (error) {
      console.error("Erreur envoi email invitation:", error);
    }

    res.status(201).json({ invitationLink, emailSent: !error, emailData: data });
  } catch (err) {
    next(err);
  }
};

const selectInvitationsByTrip: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.id);

    if (Number.isNaN(tripId)) {
      res.status(400).json({ error: "ID de voyage invalide" });
      return;
    }

    const trip = await tripRepository.read(tripId);

    if (!trip) {
      res.status(404).json({ error: "Voyage introuvable" });
      return;
    }

    const invitations = await invitationRepository.selectByTrip(tripId);

    res.json({
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        start_at: trip.start_at,
        end_at: trip.end_at,
        user_id: trip.user_id,
        owner_firstname: trip.owner_firstname,
        owner_lastname: trip.owner_lastname,
        image_url: trip.image_url,
      },
      invitations,
    });
  } catch (err) {
    next(err);
  }
};

const delate: RequestHandler = async (req, res, next) => {
  try {
    const tripId = Number(req.params.tripId);
    const userId = Number(req.params.userId);

    if (Number.isNaN(tripId) || Number.isNaN(userId)) {
      res.status(400).json({ message: "Paramètres invalides" });
      return;
    }

    const success = await invitationRepository.deleteInvitation(tripId, userId);

    if (!success) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

export default { edit, read, add, selectInvitationsByTrip, delate };
