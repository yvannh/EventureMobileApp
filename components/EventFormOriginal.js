import { useState, useEffect } from "react";
import { useEventsContext } from "../hooks/useEventsContext";
import { DayPicker } from "react-day-picker";
import { toast } from "react-toastify";
import { fr } from "date-fns/locale";
import {
  Music,
  Utensils,
  Palette,
  Gamepad2,
  Bike,
  Book,
  PartyPopper,
  Dumbbell,
  Ellipsis,
  Upload,
} from "lucide-react";
import "react-day-picker/dist/style.css";
import { useNavigate } from "react-router-dom";
import AddressAutofill from "./AddressAutofill";

const EventForm = ({ initialData = null, user }) => {
  const { dispatch } = useEventsContext();
  const navigate = useNavigate();  

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    postalCode: "",
    city: "",
    maxAttendees: "",
    category: "",
    date: null,
    time: "", 
    url_cover: "",
  });

  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(null);
  const [emptyFields, setEmptyFields] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [imageBlob, setImageBlob] = useState(null); // URL Blob pour afficher l'image
  const [imagePublicId, setImagePublicId] = useState(""); // publicId de l'image sur Cloudinary
  const [isUploading, setIsUploading] = useState(false); 

  const categories = [
    { name: "Musique", icon: Music },
    { name: "Gastronomie", icon: Utensils },
    { name: "Art", icon: Palette },
    { name: "Jeux", icon: Gamepad2 },
    { name: "Sport", icon: Bike },
    { name: "Culture", icon: Book },
    { name: "Fêtes", icon: PartyPopper },
    { name: "Bien-être", icon: Dumbbell },
    { name: "Autres", icon: Ellipsis },
  ];

  const extractPublicIdFromUrl = (url) => {
    try {
      const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
      const match = url.match(regex);
  
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de l'extraction du public_id :", error);
      return null;
    }
  };

  useEffect(() => {
    if (initialData) {
      const date = new Date(initialData.date);
      const time = date.getHours() + ":" + date.getMinutes();
      setFormData({...initialData, time})
      setImageBlob(initialData.url_cover);
      setImagePublicId(extractPublicIdFromUrl(initialData.url_cover));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategorySelect = (category) => {
    setFormData({ ...formData, category });
  };

  const handleDateSelect = (date) => {
    setFormData({ ...formData, date });
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setFormData({ ...formData, time });
  };

  const handleCancel = () =>{
    navigate("/")
  }

  const combineDateAndTime = () => {
    if (!formData.date || !formData.time) return null;

    const [hours, minutes] = formData.time.split(":");
    const combinedDate = new Date(formData.date);
    combinedDate.setHours(hours);
    combinedDate.setMinutes(minutes);

    return combinedDate;
  };

  // Gérer la sélection et l'upload de fichier
  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Récupérer le fichier sélectionné
    if (!file) return;
  
    setIsUploading(true);
    setImgError(null);
  
    try {
      const formData = new FormData();
      formData.append("image", file);
  
      // Envoyer l'image au backend pour upload et conversion en WebP
      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error("Échec de l'upload de l'image.");
      }
  
      const data = await response.json();
      setImageBlob(data.url); // Stocker l'URL de l'image pour l'afficher
      setImagePublicId(data.public_id); // Stocker le public_id uniquement pour suppression si nécessaire
    } catch (err) {
      setImgError(err.message);
      console.error("Erreur :", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Supprimer l'image
  const handleDeleteImage = async () => {
    if (!imagePublicId) return;

    try {
      const response = await fetch(`/api/cloudinary/delete/${imagePublicId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Échec de la suppression de l'image.");
      }

      setImageBlob(null);
      setImagePublicId("");
      alert("Image supprimée avec succès !");
    } catch (err) {
      setImgError(err.message);
      console.error("Erreur :", err);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePublicId) {
        handleDeleteImage(); // Supprime l'image à la sortie du composant
      }
    };
  }, [imagePublicId]);

  // Fonction pour gérer la sélection d'adresse
  const handleAddressSelect = (selectedAddress) => {
    setFormData({
      ...formData,
      address: selectedAddress.name,
      postalCode: selectedAddress.postcode,
      city: selectedAddress.city,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Vous devez être connecté pour créer un événement.");
      return;
    }

    const requiredFields = [
      "title",
      "description",
      "address",
      "postalCode",
      "city",
      "category",
      "date",
      "time",
      "maxAttendees",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field]
    );

    if (missingFields.length > 0) {
      setError('Tous les champs ne sont pas renseignés');
      setEmptyFields(missingFields);
      return;
    }

    const attendees = Number(formData.maxAttendees);
    if (formData.maxAttendees && isNaN(attendees)) {
      setError("Le nombre maximum de participants doit être un nombre valide.");
      return;
    }

    const eventDateTime = combineDateAndTime();
    if (!eventDateTime) {
      setError("La date et l'heure sont obligatoires.");
      return;
    }

    const event = { ...formData, date: eventDateTime, maxAttendees: attendees, url_cover: imageBlob, url_api: "" };

    try {
      setError(null);
      setIsLoading(true);

      const method = initialData ? 'PATCH' : 'POST';
      const url = initialData ? `http://10.0.2.2:4000/api/events/${initialData._id}` : `http://10.0.2.2:4000/api/events`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(event),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error);
        setEmptyFields(json.emptyFields || []);
      } else {
        // Upload de l'image après la soumission
        if (imageBlob) {
          await handleFileUpload(imageBlob);
        }

        setFormData({
          title: "",
          description: "",
          address: "",
          postalCode: "",
          city: "",
          maxAttendees: "",
          category: "",
          date: null,
          time: "",  
          url_cover:"",
        });
        setImageBlob(null);
        setImagePublicId("");
        setError(null);
        setEmptyFields([]);
        dispatch({ type: "CREATE_EVENT", payload: json });
        toast.success("Événement créé avec succès !");
        navigate("/my-events");
        window.scrollTo(0, 0); 
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFileUpload = async (file) => {
    setIsUploading(true);
    setImgError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      // Envoyer l'image au backend pour upload et conversion en WebP
      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Échec de l'upload de l'image.");
      }

      const data = await response.json();
      setImageBlob(data.url); // Stocker l'URL de l'image pour l'afficher
      setImagePublicId(data.public_id); // Stocker le public_id uniquement pour suppression si nécessaire
    } catch (err) {
      setImgError(err.message);
      console.error("Erreur :", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations générales */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Informations générales</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titre de l'événement
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-4 mb-4 border rounded-lg ${
                emptyFields.includes("title")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-4 mb-4 border rounded-lg ${
                emptyFields.includes("description")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Catégorie */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Catégorie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`flex flex-col items-center p-4 rounded-lg border transition ${
                    formData.category === cat.name
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-rose-500"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 ${
                      formData.category === cat.name
                        ? "text-rose-500"
                        : "text-gray-500"
                    }`}
                  />
                  <span className="mt-2 text-sm font-medium">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date et Heure */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Date et Heure</h2>
          <div className="flex justify-center items-center space-x-8">
            <div>
              <DayPicker
                mode="single"
                selected={formData.date}
                onSelect={handleDateSelect}
                locale={fr}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-center">
                Heure (HH:MM)
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleTimeChange}
                className={`mt-1 w-24 border rounded-md p-2 ${
                  emptyFields.includes("time") ? "border-red-500" : ""
                }`}
              />
            </div>
          </div>
        </div>

        {/* Lieu */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Lieu</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <AddressAutofill onAddressSelect={handleAddressSelect} initialAddress={formData.address} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code postal
            </label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={`w-full p-4 mb-4 border rounded-lg ${
                emptyFields.includes("postalCode")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ville
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full p-4 mb-4 border rounded-lg ${
                emptyFields.includes("city")
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Participants */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Participants</h2>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre maximum de participants
          </label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            className={`w-full p-4 mb-4 border rounded-lg ${
              emptyFields.includes("maxAttendees")
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Image de l'événement</h2>

          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Veuillez choisir une image :
              </p>
              <label className="mt-2 cursor-pointer">
                <span className="text-sm font-medium text-rose-500 hover:text-rose-600">
                  Parcourir
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
              {isUploading && <p>Upload en cours...</p>}
              {imageBlob && (
                <p className="mt-2 text-sm text-gray-600">Image uploadée</p>
              )}
              {imgError && <p style={{ color: "red" }}>{imgError}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Chargement..." : (initialData ? "Modifier l'événement" : 'Créer un événement')}
          </button>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}
      </form>
    </div>
  );
};

export default EventForm;
