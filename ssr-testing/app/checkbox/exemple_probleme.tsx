// Ce fichier est une implémentation du problème de base
// Il génère une erreur "infinite depth"
// Pour tester le problème, il faut renommer le fichier en page.tsx

'use client';

import * as React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';

export default function Page() {
  // État (booléen) associé à la checkbox et au div
  const [isChecked, setIsChecked] = React.useState(false);

  // Fonction pour alterner l’état de la checkbox
  const handleCheckedChange = (newChecked: boolean) => {
    console.log('Checkbox checked:', newChecked); // Affiche l'état dans la console
    setIsChecked(newChecked);
  };

  return (
    <form>
      <div onClick={() => setIsChecked((prev) => !prev)}> {/* Alterne l’état*/}
        <Checkbox.Root checked={isChecked} onCheckedChange={handleCheckedChange}> {/* Associe l'état de la checkbox et la fonction d'inversion de l'état*/}
          [ <Checkbox.Indicator>✔</Checkbox.Indicator> ]
        </Checkbox.Root>
        <span>test</span>
      </div>
    </form>
  );
}