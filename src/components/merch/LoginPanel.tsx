import { Mail } from "lucide-react";
import type { FormEvent } from "react";
import { useId } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MerchCopy } from "@/config/merch-copy";

type LoginPanelProps = {
	t: MerchCopy;
	email: string;
	error: string | null;
	onEmailChange: (value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function LoginPanel({
	t,
	email,
	error,
	onEmailChange,
	onSubmit,
}: LoginPanelProps) {
	const emailInputId = useId();

	return (
		<Card className="w-full max-w-md overflow-hidden border-orange-200/60 shadow-xl">
			<div className="h-1.5 bg-[linear-gradient(90deg,#ffa000_20%,#ff4b00,#ff0035)]" />
			<CardHeader>
				<Badge className="w-fit bg-primary text-primary-foreground">
					{t.appTitle}
				</Badge>
				<CardTitle>{t.loginTitle}</CardTitle>
				<CardDescription>{t.loginSubtitle}</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="space-y-4" onSubmit={onSubmit}>
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor={emailInputId}>
							{t.emailLabel}
						</label>
						<div className="relative">
							<Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id={emailInputId}
								type="email"
								value={email}
								onChange={(event) => onEmailChange(event.target.value)}
								placeholder={t.emailPlaceholder}
								className="pl-9"
							/>
						</div>
					</div>
					{error ? <p className="text-sm text-destructive">{error}</p> : null}
					<Button type="submit" className="w-full">
						{t.signIn}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
