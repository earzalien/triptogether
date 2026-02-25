import type { Guest } from "../types/invitationType";
import "../pages/styles/Guests.css";

type GuestsProps = {
  title: string;
  invited: Guest[];
  type: "attendees" | "others";
  delete?: (invitation: Guest) => void;
};

function Guests({ title, invited, type, delete: onDelete }: GuestsProps) {
  return (
    <article className="guests-article">
      <h3 className="guests-title">
        {title} <span className="count">({invited.length})</span>
      </h3>

      <ul className="guests-list">
        {invited.map((invitation) => {
          const addedDate = invitation.addedAt
            ? new Date(invitation.addedAt).toLocaleDateString("fr-FR")
            : null;

          const reminderDate = invitation.lastReminderAt
            ? new Date(invitation.lastReminderAt).toLocaleDateString("fr-FR")
            : null;

          return (
            <li key={invitation.id} className="guest-item">
              <div className="guest-left">
                <div
                  className={`avatar ${type === "others" ? "avatar-empty" : ""
                    }`}
                >
                  {invitation.avatarUrl ? (
                    <img
                      src={invitation.avatarUrl}
                      alt={`Avatar de ${invitation.name}`}
                    />
                  ) : (
                    <span>👤</span>
                  )}
                </div>

                <div className="guest-info">
                  <p className="name">{invitation.name}</p>

                  {addedDate && (
                    <p className="date">Ajouté le {addedDate}</p>
                  )}

                  {reminderDate && (
                    <p className="date date-small">
                      Relancé le {reminderDate}
                    </p>
                  )}
                </div>
              </div>

              <div className="guest-right">
                {type === "attendees" ? (
                  invitation.role === "organisateur" ? (
                    <span className="badge badge-organisateur">
                      Organisateur
                    </span>
                  ) : (
                      <button
                      type = "button"
                      className="badge badge-action"
                      onClick={() => onDelete?.(invitation)}
                    >
                      Retirer
                    </button>
                  )
                ) : invitation.inviteState === "refuse" ? (
                  <span className="badge badge-refuse">Refusé</span>
                ) : (
                  <span className="badge badge-pending">
                    En attente
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}

export default Guests;
