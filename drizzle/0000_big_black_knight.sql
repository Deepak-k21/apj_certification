CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`session_hash` text NOT NULL,
	`request_id` text NOT NULL,
	`status` text NOT NULL,
	`currency` text NOT NULL,
	`total_minor` integer,
	`details` text NOT NULL,
	`order_id` text,
	`payment_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_reference_unique` ON `registrations` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_order_id_unique` ON `registrations` (`order_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `registration_request` ON `registrations` (`session_hash`,`request_id`);