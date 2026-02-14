import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ProductImageCarouselProps = {
  id: string
  alt: string
  imageGallery?: string[]
  gradientClass: string
  className?: string
}

export function ProductImageCarousel({
  id,
  alt,
  imageGallery,
  gradientClass,
  className,
}: ProductImageCarouselProps) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  const validImages = useMemo(
    () => (imageGallery ?? []).filter((src) => !failed[src]),
    [failed, imageGallery],
  )

  const imageCount = validImages.length
  const hasImages = imageCount > 0
  const currentImage = hasImages ? validImages[index % imageCount] : null

  const goPrevious = () => {
    setIndex((current) => (current - 1 + imageCount) % imageCount)
  }

  const goNext = () => {
    setIndex((current) => (current + 1) % imageCount)
  }

  return (
    <div className={cn('relative overflow-hidden rounded-xl', className)}>
      {currentImage ? (
        <img
          src={currentImage}
          alt={alt}
          className="h-full w-full bg-muted/20 object-contain p-2"
          loading="lazy"
          onError={() =>
            setFailed((previous) => ({
              ...previous,
              [currentImage]: true,
            }))
          }
        />
      ) : (
        <div className={cn('h-full w-full bg-gradient-to-br', gradientClass)} />
      )}

      {imageCount > 1 ? (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-1/2 left-2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/85"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              goPrevious()
            }}
            aria-label={`${id}-previous-image`}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute top-1/2 right-2 h-7 w-7 -translate-y-1/2 rounded-full bg-background/85"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              goNext()
            }}
            aria-label={`${id}-next-image`}
          >
            <ChevronRight className="size-4" />
          </Button>
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-background/80 px-2 py-1">
            {validImages.map((src, dotIndex) => (
              <span
                key={src}
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  dotIndex === index % imageCount ? 'bg-foreground' : 'bg-muted-foreground/50',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
