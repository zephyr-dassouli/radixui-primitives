// Pour tester le problème, il faut renommer le fichier en page.tsx

'use client';

import * as React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';

export default function Page() {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckedChange = (newChecked: boolean) => {
    console.log('Checkbox checked:', newChecked); // Affiche l'état dans la console
    setIsChecked(newChecked);
  };

  return (
    <form>
      <div onClick={() => setIsChecked((prev) => !prev)}>
        <Checkbox.Root checked={isChecked} onCheckedChange={handleCheckedChange}>
          [ <Checkbox.Indicator>✔</Checkbox.Indicator> ]
        </Checkbox.Root>
        <span>test</span>
      </div>
    </form>
  );
}