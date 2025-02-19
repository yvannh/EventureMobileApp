import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Comment ça marche</li>
              <li>Actualités</li>
              <li>Investisseurs</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Communauté</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Organisateurs</li>
              <li>Partenaires</li>
              <li>Sponsors</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Assistance</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Centre d'aide</li>
              <li>Sécurité</li>
              <li>Nous contacter</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Conditions</li>
              <li>Confidentialité</li>
              <li>Cookies</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          © 2024 Eventure. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
