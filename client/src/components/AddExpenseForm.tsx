import "../pages/styles/AddExpenseForm.css";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

type Member = {
  id: number;
  firstname?: string;
  email?: string;
};

type AddExpenseFormProps = {
  tripId: number;
  members: Member[];
  onSuccess: () => void;
};

function AddExpenseForm({ tripId, members, onSuccess }: AddExpenseFormProps) {
  const { auth } = useAuth();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!auth?.token) {
      setError("Utilisateur non authentifié.");
      return;
    }

    if (!title || !amount || !categoryId || !paidBy) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/expenses/${tripId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            tripId,
            title,
            amount: Number(amount),
            paid_by: Number(paidBy),
            category_id: Number(categoryId),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur création dépense");
      }

      // Reset
      setTitle("");
      setAmount("");
      setCategoryId("");
      setPaidBy("");

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="add-expense-form" onSubmit={handleSubmit} noValidate>
      <h2 id="add-expense-title">Ajouter une dépense</h2>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      {/* Titre */}
      <div className="form-group">
        <label htmlFor="title">Titre</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Montant */}
      <div className="form-group">
        <label htmlFor="amount">Montant (€)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      {/* Catégorie */}
      <div className="form-group">
        <label htmlFor="category">Catégorie</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Choisir une catégorie</option>
          <option value="1">Transport</option>
          <option value="2">Nourriture</option>
          <option value="3">Logement</option>
          <option value="4">Activité</option>
          <option value="5">Autre</option>
        </select>
      </div>

      {/* Payé par */}
      <div className="form-group">
        <label htmlFor="paidBy">Payé par</label>
        <select
          id="paidBy"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          required
        >
          <option value="">Sélectionner un membre</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstname || member.email}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}

export default AddExpenseForm;
