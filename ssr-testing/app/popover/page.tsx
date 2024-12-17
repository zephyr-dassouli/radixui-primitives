import * as Popover from '@radix-ui/react-popover';

export default function Page() {
  return (
    <Popover.Root>
      <Popover.Trigger>open</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={5}>
          <Popover.SubTrigger>Sous Item</Popover.SubTrigger>
          <Popover.SubContent>
            <Popover.Close>close</Popover.Close>
            <Popover.Arrow width={20} height={10} />
          </Popover.SubContent>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
