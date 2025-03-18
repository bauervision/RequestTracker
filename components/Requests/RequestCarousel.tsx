import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { NewRequestPage1 } from "./requestPages/page1";
import { NewRequestPage2 } from "./requestPages/page2";
import { NewRequestPage3 } from "./requestPages/page3";
import { NewRequestPage4 } from "./requestPages/page4";
import { NewRequestPage5 } from "./requestPages/page5";

export function RequestCarousel() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleValueChange = (value: string) => {
    console.log(value);
  };

  return (
    <>
      <Carousel
        setApi={setApi}
        className=" h-[300px] flex  items-center justify-center"
      >
        <CarouselContent>
          {/* Page 1 */}
          <CarouselItem className="h-full w-full relative">
            <NewRequestPage1 onValueChange={handleValueChange} />
          </CarouselItem>

          {/* Page 2 */}
          <CarouselItem className="h-full">
            <NewRequestPage2 onValueChange={handleValueChange} />
          </CarouselItem>

          {/* Page 3 */}
          <CarouselItem className="h-full">
            <NewRequestPage3 onValueChange={handleValueChange} />
          </CarouselItem>

          {/* Page 4 */}
          <CarouselItem className="h-full">
            <NewRequestPage4 onValueChange={handleValueChange} />
          </CarouselItem>

          {/* Page 5 */}
          <CarouselItem className="h-100">
            <NewRequestPage5 onValueChange={handleValueChange} />
          </CarouselItem>
        </CarouselContent>

        {/* Controller Buttons */}
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Carousel Status */}
      <div className="py-2 text-center text-sm text-muted-foreground">
        Page {current} of {count}
      </div>
    </>
  );
}
