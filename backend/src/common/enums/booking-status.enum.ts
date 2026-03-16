export enum BookingStatus {
  PENDING = 'PENDING',         // waiting for owner approval
  CONFIRMED = 'CONFIRMED',       // accepted by owner
  REJECTED = 'REJECTED',       // rejected by owner
  CANCELLED = 'CANCELLED',     // cancelled by customer/admin
  COMPLETED = 'COMPLETED',     // rental finished
}

