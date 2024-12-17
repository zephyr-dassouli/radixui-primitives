import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

export default function Page() {
  return (
    <div className="App">
      <h1>Radix Primitives Template</h1>
      <div style={{ margin: '1rem 0' }}>
        <Collapsible>
          <CollapsibleTrigger>Open</CollapsibleTrigger>
          <CollapsibleContent className="collapsible-content">
            <div style={{ height: '200px', background: 'red' }} />
            <Collapsible>
              <CollapsibleTrigger>Open (Nested)</CollapsibleTrigger>
              <CollapsibleContent className="collapsible-content">{/* Empty */}</CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>
        <div>End</div>
      </div>
    </div>
  );
}
