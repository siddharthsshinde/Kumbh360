import React, { useState, useEffect } from "react";
import { format, addDays, differenceInDays, isBefore, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, Loader2, CheckCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { TripAdvisorHotel } from "@/lib/tripAdvisorApi";
import { cn } from "@/lib/utils";

interface AccommodationBookingSheetProps {
  accommodation: TripAdvisorHotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCheckIn?: Date;
  initialCheckOut?: Date;
}

export function AccommodationBookingSheet({
  accommodation,
  open,
  onOpenChange,
  initialCheckIn,
  initialCheckOut,
}: AccommodationBookingSheetProps) {
  const { toast } = useToast();
  const today = startOfDay(new Date());
  const [checkIn, setCheckIn] = useState<Date>(initialCheckIn ?? addDays(today, 1));
  const [checkOut, setCheckOut] = useState<Date>(initialCheckOut ?? addDays(today, 2));

  useEffect(() => {
    if (open && initialCheckIn && initialCheckOut) {
      setCheckIn(initialCheckIn);
      setCheckOut(initialCheckOut);
    }
  }, [open, initialCheckIn, initialCheckOut]);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !accommodation) return;
    setBookingSuccess(false);
    setBookingId(null);
  }, [open, accommodation?.id]);

  useEffect(() => {
    if (!accommodation || !open) return;
    const check = async () => {
      setIsCheckingAvailability(true);
      setAvailable(null);
      try {
        const res = await apiRequest<{ available: boolean }>(
          `/api/accommodations/${accommodation.id}/availability?checkIn=${format(checkIn, "yyyy-MM-dd")}&checkOut=${format(checkOut, "yyyy-MM-dd")}`
        );
        setAvailable(res.available);
      } catch {
        setAvailable(false);
      } finally {
        setIsCheckingAvailability(false);
      }
    };
    check();
  }, [accommodation?.id, checkIn, checkOut, open]);

  const nights = differenceInDays(checkOut, checkIn) || 1;
  const pricePerNight = accommodation
    ? Math.round((accommodation.price.from + accommodation.price.to) / 2)
    : 0;
  const totalPrice = pricePerNight * nights * rooms;

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) return;
    setCheckIn(range.from);
    setCheckOut(range.to ? (isBefore(range.to, range.from) ? addDays(range.from, 1) : range.to) : addDays(range.from, 1));
  };

  const handleBook = async () => {
    if (!accommodation) return;
    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      toast({
        title: "Missing details",
        description: "Please fill in your name, email and phone.",
        variant: "destructive",
      });
      return;
    }
    if (!available) {
      toast({
        title: "Not available",
        description: "Selected dates are not available. Please choose different dates.",
        variant: "destructive",
      });
      return;
    }
    setIsBooking(true);
    try {
      const res = await apiRequest<{ success: boolean; bookingId: string }>(
        "/api/accommodations/book",
        {
          method: "POST",
          body: JSON.stringify({
            accommodationId: accommodation.id,
            accommodationName: accommodation.name,
            checkIn: format(checkIn, "yyyy-MM-dd"),
            checkOut: format(checkOut, "yyyy-MM-dd"),
            rooms,
            guests,
            guestName: guestName.trim(),
            guestEmail: guestEmail.trim(),
            guestPhone: guestPhone.trim(),
            totalPrice,
          }),
        }
      );
      setBookingSuccess(true);
      setBookingId(res.bookingId);
      toast({
        title: "Booking confirmed",
        description: `Your booking at ${accommodation.name} is confirmed.`,
        variant: "default",
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Booking failed";
      toast({
        title: "Booking failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (!accommodation) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-[#FF7F00]">Book {accommodation.name}</SheetTitle>
          <SheetDescription>
            Select your dates and complete the booking. Real-time availability shown.
          </SheetDescription>
        </SheetHeader>
        {bookingSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-4">
            <CheckCircle className="h-16 w-16 text-[#138808]" />
            <h3 className="font-semibold text-lg">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground">
              Your stay at <strong>{accommodation.name}</strong> from {format(checkIn, "MMM d, yyyy")} to {format(checkOut, "MMM d, yyyy")} is confirmed.
            </p>
            {bookingId && (
              <p className="text-xs text-muted-foreground">Booking ID: {bookingId}</p>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-6">
            <div>
              <Label className="text-sm font-medium">Check-in & Check-out</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-2 justify-start text-left font-normal",
                      !checkIn && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(checkIn, "MMM d, yyyy")} – {format(checkOut, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: checkIn, to: checkOut }}
                    onSelect={handleDateSelect}
                    disabled={(date) => isBefore(date, today)}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Rooms</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={rooms}
                  onChange={(e) => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-2"
                />
              </div>
              <div className="flex-1">
                <Label>Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                  className="mt-2"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isCheckingAvailability ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : available === true ? (
                <span className="text-[#138808] font-medium">✓ Available</span>
              ) : available === false ? (
                <span className="text-red-600 font-medium">Not available for these dates</span>
              ) : null}
            </div>
            <div className="border-t pt-4 space-y-4">
              <Label className="text-sm font-medium">Guest details</Label>
              <Input
                placeholder="Full name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />
              <Input
                type="email"
                placeholder="Email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
              <Input
                type="tel"
                placeholder="Phone (e.g. +91 9876543210)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center border-t pt-4">
              <span className="font-medium">Total</span>
              <span className="text-lg font-semibold text-[#FF7F00]">
                ₹{totalPrice.toLocaleString()}
              </span>
            </div>
            <SheetFooter>
              <Button
                className="w-full bg-[#FF7F00] hover:bg-[#E67300] text-white"
                onClick={handleBook}
                disabled={isBooking || !available || available === null}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
