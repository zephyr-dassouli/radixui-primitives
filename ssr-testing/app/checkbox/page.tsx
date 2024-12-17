// Ce fichier est une implémentation de la solution que nous proposons
// Il dissocie l'état de la checkbox et du div
// Le problème "infinite depth" est résolu tout en laissant le div cliquable

'use client';

import * as React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';

export default function Page() {
  // État pour le div
  const [isDivChecked, setIsDivChecked] = React.useState(false);

  // État pour la case à cocher
  const [isCheckboxChecked, setIsCheckboxChecked] = React.useState(false);

  // Fonction pour alterner l’état du div
  const handleDivClick = () => {
    console.log('Div clicked:', !isDivChecked);
    setIsDivChecked((prev) => !prev);
  };

  // Fonction pour alterner l’état de la checkbox
  const handleCheckedChange = (newChecked: boolean) => {
    console.log('Checkbox checked:', newChecked);
    setIsCheckboxChecked(newChecked);
  };

  return (
    <form>
      <div onClick={handleDivClick}> {/* Alterne l’état du div */}
        <Checkbox.Root 
          checked={isCheckboxChecked} 
          onCheckedChange={handleCheckedChange} // Alterne l’état de la checkbox
        >
          [ <Checkbox.Indicator>✔</Checkbox.Indicator> ]
        </Checkbox.Root>
        <span>test</span>
      </div>
    </form>
  );
}