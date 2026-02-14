import { ShoppingCart, SlidersHorizontal } from "lucide-react";

import { ProductImageCarousel } from "@/components/merch/ProductImageCarousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MerchCopy } from "@/config/merch-copy";
import type { Product, StoreLocale } from "@/types/merch";

type CatalogSectionProps = {
	t: MerchCopy;
	locale: StoreLocale;
	search: string;
	filteredProducts: Product[];
	formatCurrency: Intl.NumberFormat;
	onSearchChange: (value: string) => void;
	onOpenProduct: (productId: string) => void;
	onQuickAdd: (productId: string) => void;
};

export function CatalogSection({
	t,
	locale,
	search,
	filteredProducts,
	formatCurrency,
	onSearchChange,
	onOpenProduct,
	onQuickAdd,
}: CatalogSectionProps) {
	return (
		<section className="animate-fade-up-delay">
			<Card className="border-orange-200/50 shadow-md">
				<CardHeader className="space-y-4">
					<div className="relative lg:max-w-sm lg:flex-1">
						<SlidersHorizontal className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
							placeholder={t.search}
							className="pl-9"
						/>
					</div>
				</CardHeader>

				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
						{filteredProducts.map((product) => (
							<article
								key={product.id}
								className="flex h-full cursor-pointer flex-col rounded-2xl bg-card/85 p-4 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md dark:ring-white/8"
								onClick={() => onOpenProduct(product.id)}
								onKeyDown={(event) => {
									if (event.key === "Enter" || event.key === " ") {
										event.preventDefault();
										onOpenProduct(product.id);
									}
								}}
							>
								<ProductImageCarousel
									id={product.id}
									alt={product.name[locale]}
									imageGallery={product.imageGallery}
									gradientClass={product.gradientClass}
									className="mb-4 h-40"
								/>

								<div className="flex items-start justify-between gap-3">
									<div>
										<h3 className="font-semibold">{product.name[locale]}</h3>
										<p className="mt-1 text-sm text-muted-foreground">
											{product.description[locale]}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold">
											{formatCurrency.format(product.price)}
										</p>
										<p className="text-xs text-muted-foreground">{t.perItem}</p>
									</div>
								</div>

								{(product.variantGroups ?? []).length > 0 ? (
									<p className="mt-3 text-xs text-muted-foreground">
										{(product.variantGroups ?? []).length} {t.variants}
									</p>
								) : null}

								<div className="mt-auto pt-4 grid grid-cols-2 gap-2">
									<Button
										variant="outline"
										onClick={(event) => {
											event.stopPropagation();
											onOpenProduct(product.id);
										}}
									>
										{t.viewDetails}
									</Button>
									<Button
										onClick={(event) => {
											event.stopPropagation();
											onQuickAdd(product.id);
										}}
									>
										<ShoppingCart className="size-4" />
										{(product.variantGroups ?? []).length > 0
											? t.selectVariant
											: t.quickAdd}
									</Button>
								</div>
							</article>
						))}
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
