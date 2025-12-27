"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatioRoot = AspectRatioPrimitive.Root as any;

function AspectRatio(props: any) {
  return <AspectRatioRoot data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
