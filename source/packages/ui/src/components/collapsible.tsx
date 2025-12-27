"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const CollapsibleRoot = CollapsiblePrimitive.Root as any;
const CollapsibleTriggerPrimitive = CollapsiblePrimitive.Trigger as any;
const CollapsibleContentPrimitive = CollapsiblePrimitive.Content as any;

function Collapsible({
  ...props
}: any) {
  return <CollapsibleRoot data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: any) {
  return (
    <CollapsibleTriggerPrimitive
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: any) {
  return (
    <CollapsibleContentPrimitive
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
