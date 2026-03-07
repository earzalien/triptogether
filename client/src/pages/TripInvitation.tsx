import { useState } from "react";
import { useParams } from "react-router";
import { ToastContainer, toast } from "react-toastify";

import "./styles/TripInvitation.css";

type InvitationForm = {
  email: string;
  message: string;
};

type TripInvitationProps = {
  tripId: number;
  title: string;
  city: string;
  country: string;
  startAt: string;
  endAt: string;
  participants?: number;
  onClose?: (e: React.MouseEvent<HTMLElement>) => void;
};

function TripInvitation({
  title,
  city,
  country,
  startAt,
  endAt,
  participants,
  onClose,
}: TripInvitationProps) {
  const { id } = useParams<{ id: string }>();

  const [invitationForm, setInvitationForm] = useState<InvitationForm>({
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const updateInvitationForm = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setInvitationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cancelInvitation = (e: React.MouseEvent<HTMLButtonElement>) => {
    setInvitationForm({ email: "", message: "" });
    if (onClose) onClose(e);
  };

  const closeModalOverlay = (e: React.MouseEvent<HTMLElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose(e);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Lien d’invitation copié 📋");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/trips/${id}/invitations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(invitationForm),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      await copyToClipboard(data.invitationLink);
      setInvitationForm({ email: "", message: "" });
    } catch {
      toast.error("Erreur lors de l'envoi de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="tripinvitation-overlay"
      onClick={closeModalOverlay}
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) {
          onClose(e as unknown as React.MouseEvent<HTMLElement>);
        }
      }}
      aria-modal="true"
    >

      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <article className="tripinvitation-invitation-form">
        <div className="tripinvitation-head">
          <p>
            <img src="/letter-picture.png" alt="" width={60} />
            Inviter un participant
          </p>
          <span>Invitez une personne à rejoindre ce voyage par email</span>
        </div>

        <div className="tripinvitation-bg-image" />

        <div className="tripinvitation-trip-infos">
          <h2>{title}</h2>

          <div className="tripinvitation-location">
            📍 {city}, {country}
          </div>

          <div className="tripinvitation-meta">
            <div>
              📅 {formatDate(startAt)} - {formatDate(endAt)}
            </div>

            <div>
              👥 {participants ?? 0} participant
              {participants && participants > 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <form onSubmit={sendInvitation} className="tripinvitation-form-inputs">
          <label>
            Adresse email*
            <input
              type="email"
              name="email"
              value={invitationForm.email}
              onChange={updateInvitationForm}
              required
              placeholder="adresse@email.com"
            />
          </label>

          <label>
            Message
            <textarea
              name="message"
              value={invitationForm.message}
              onChange={updateInvitationForm}
              placeholder="Ajoutez un message personnalisé..."
            />
          </label>

          <button
            type="submit"
            className="tripinvitation-btn-send-invitation"
            disabled={loading}
          >
            {loading ? "Copie..." : "Copier le lien d'invitation"}
          </button>

          <button
            type="button"
            className="tripinvitation-btn-cancel-invitation"
            onClick={cancelInvitation}
            disabled={loading}
          >
            Annuler
          </button>
        </form>
      </article>
    </section>
  );
}

export default TripInvitation;
