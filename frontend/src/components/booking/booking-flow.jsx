"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, X, AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { currency, pad2, slugify } from "@/util";
import { useCustomerSession } from "@/lib/customer-session";
import { availableSlots, resolveStaff } from "@/lib/salon";
import { BookingStepper } from "./stepper";
import { BookingSummary } from "./booking-summary";
import { DatePicker } from "./date-picker";
import { StepArtist } from "./step-artist";
import { StepDetails } from "./step-details";
import { StepTreatments } from "./step-treatments";
import { TimeSlotPicker } from "./time-slot-picker";
import { WaitlistInvite } from "./waitlist-invite";
import { PromoField } from "./promo-field";
import { appointmentService, nailService, categoryService, staffService } from "@/services";

function generateBookingCode() {
  return `VELA-${Date.now().toString().slice(-6)}`;
}

const HEADINGS = [
  {
    title: "CHỌN DỊCH VỤ",
    sub: "Một dịch vụ, một khoảng thời gian dành riêng cho bạn.",
  },
  {
    title: "CHỌN NHÂN VIÊN",
    sub: "Chọn chuyên viên yêu thích hoặc để VELA sắp xếp.",
  },
  {
    title: "CHỌN NGÀY & GIỜ",
    sub: "Giờ trống theo lịch hẹn hiện có và giờ hoạt động của salon (07:00 - 22:00).",
  },
  {
    title: "THÔNG TIN CỦA BẠN",
    sub: "Để salon liên hệ và chuẩn bị cho buổi hẹn.",
  },
  {
    title: "KIỂM TRA LỊCH HẸN",
    sub: "Xem lại thông tin trước khi gửi yêu cầu đặt lịch.",
  },
];

export function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const { customer, ready, isAuthenticated } = useCustomerSession();

  const [services, setServices] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [staff, setStaff] = React.useState([]);
  const [appointments, setAppointments] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [apiError, setApiError] = React.useState(null);

  React.useEffect(() => {
    if (ready && !isAuthenticated) {
      const qs = params.toString();
      const returnUrl = qs ? `/booking?${qs}` : "/booking";
      router.replace(`/account/login?next=${encodeURIComponent(returnUrl)}`);
    }
  }, [ready, isAuthenticated, params, router]);

  const loadApiData = React.useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const [servicesData, categoriesData, staffData, busyData] = await Promise.all([
        nailService.getAll(),
        categoryService.getAll().catch(() => []),
        staffService.getAll().catch(() => []),
        appointmentService.getBusySlots().catch(() => []),
      ]);

      setAppointments(Array.isArray(busyData) ? busyData : []);

      const catMap = new Map();
      const mappedCats = (categoriesData || []).map((c) => {
        const slug = slugify(c.name) || `cat-${c.id}`;
        catMap.set(c.id, slug);
        return {
          id: String(c.id),
          slug,
          name: c.name,
          active: c.status !== "INACTIVE",
        };
      });

      const mappedServices = (servicesData || [])
        .filter((s) => s.status !== "INACTIVE")
        .map((s) => ({
          id: String(s.id),
          slug: `${slugify(s.name)}-${s.id}`,
          name: s.name,
          categorySlug: catMap.get(s.categoryId) || "all",
          summary: s.description || "Dịch vụ chất lượng cao.",
          description: s.description || "",
          durationMin: s.durationMinutes || 45,
          price: Number(s.price) || 0,
          image: s.imageUrl || "/images/photo-1610992015836-7c249d75782d.jpg",
          active: s.status !== "INACTIVE",
        }));

      const mappedStaff = (staffData || [])
        .filter((stf) => stf.status !== "INACTIVE")
        .map((stf) => ({
          id: String(stf.id),
          slug: slugify(stf.fullName || stf.username) || `staff-${stf.id}`,
          name: stf.fullName || stf.username || "Chuyên viên VELA",
          discipline: stf.position || "Chuyên viên làm móng",
          role: "Chuyên viên",
          experienceYears: stf.experienceYears || 3,
          specialties: stf.specialties || ["Sơn Gel phom chuẩn", "Chăm sóc móng chuyên sâu"],
          bio: stf.bio || "Chuyên viên tận tâm tại VELA.",
          portrait: stf.avatarUrl || "/images/photo-1533933269825-da140ad3132f.jpg",
          active: true,
          serviceIds: mappedServices.map((s) => s.id),
        }));

      setCategories(mappedCats);
      setServices(mappedServices);
      setStaff(mappedStaff);
    } catch (err) {
      console.error("Booking API Error:", err);
      setApiError(
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải dữ liệu từ máy chủ Backend. Vui lòng kiểm tra lại dịch vụ Spring Boot."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadApiData();
  }, [loadApiData]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40">
        <div className="size-8 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
        <p className="mt-4 text-[0.9375rem] text-ink/60">Vui lòng đăng nhập để bắt đầu đặt lịch…</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40">
        <div className="size-8 animate-spin rounded-full border-2 border-champagne border-t-transparent" />
        <p className="mt-4 text-[0.9375rem] text-ink/60">Đang chuẩn bị lịch hẹn từ hệ thống…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="gutter flex min-h-[60vh] flex-col items-center justify-center py-40 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="mt-6 font-display text-[2rem] tracking-tight text-ink">Lỗi kết nối máy chủ</h2>
        <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink/60">{apiError}</p>
        <button
          onClick={loadApiData}
          className="mt-6 inline-flex items-center gap-2 border border-ink/20 px-6 py-3 text-xs tracking-widest uppercase transition-colors hover:border-ink hover:bg-ink hover:text-white"
        >
          <RefreshCw className="size-3.5" /> Thử lại
        </button>
      </div>
    );
  }

  return (
    <BookingContent
      key={params.toString()}
      services={services}
      categories={categories}
      staff={staff}
      appointments={appointments}
    />
  );
}

function BookingContent({ services, categories, staff, appointments = [] }) {
  const router = useRouter();
  const params = useSearchParams();
  const reduced = useReducedMotion();

  const presetService = services.find(
    (item) => item.slug === params.get("service") || item.id === params.get("service"),
  );
  const presetArtist = staff.find(
    (item) => item.slug === params.get("artist") || item.id === params.get("artist"),
  );

  const [step, setStep] = React.useState(0);
  const [category, setCategory] = React.useState(
    params.get("category") ?? presetService?.categorySlug ?? "all",
  );
  const [serviceIds, setServiceIds] = React.useState(
    presetService ? [presetService.id] : [],
  );
  const [artistId, setArtistId] = React.useState(presetArtist?.id ?? "any");
  const [date, setDate] = React.useState(null);
  const [time, setTime] = React.useState(null);
  const [details, setDetails] = React.useState({});

  const { customer } = useCustomerSession();
  React.useEffect(() => {
    if (customer) {
      setDetails((current) =>
        current.name || current.phone || current.email
          ? current
          : {
              name: customer.name || "",
              phone: customer.phone || "",
              email: customer.email || "",
            },
      );
    }
  }, [customer]);

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [summaryOpen, setSummaryOpen] = React.useState(false);
  const submittingRef = React.useRef(false);
  const [promoCode, setPromoCode] = React.useState("");
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [couponId, setCouponId] = React.useState(null);
  const [busyAppointments, setBusyAppointments] = React.useState(appointments);

  React.useEffect(() => {
    setBusyAppointments(appointments);
  }, [appointments]);

  React.useEffect(() => {
    if (!date) return;
    let active = true;
    appointmentService
      .getBusySlots(date)
      .then((data) => {
        if (active && Array.isArray(data)) {
          setBusyAppointments(data);
        }
      })
      .catch((err) => {
        console.error("Không thể tải khung giờ bận theo ngày:", err);
      });
    return () => {
      active = false;
    };
  }, [date, artistId]);

  const chosen = React.useMemo(() => {
    return serviceIds
      .map((id) => services.find((item) => item.id === id))
      .filter(Boolean);
  }, [serviceIds, services]);

  const duration = React.useMemo(() => {
    return chosen.reduce((sum, item) => sum + item.durationMin, 0);
  }, [chosen]);

  const price = React.useMemo(() => {
    return chosen.reduce((sum, item) => sum + item.price, 0);
  }, [chosen]);

  const artists = staff.filter((item) => item.active);
  const artistValid = Boolean(
    artistId &&
    (artistId === "any" || artists.some((item) => item.id === artistId)),
  );

  const slots = React.useMemo(() => {
    if (!date || !chosen.length) return [];
    return availableSlots(
      { staff, appointments: busyAppointments },
      date,
      artistId,
      duration,
      serviceIds,
    );
  }, [date, chosen, duration, artistId, staff, busyAppointments, serviceIds]);

  const slotValid = Boolean(
    time && slots.some((slot) => slot.time === time && slot.available),
  );

  const artist =
    artists.find((item) => item.id === artistId) ??
    (artists.length > 0 ? artists[0] : null);

  const summary = {
    services: chosen,
    artist: artistId === "any" ? null : artist,
    anyArtist: artistId === "any",
    date,
    time,
    totalPrice: price,
    totalDuration: duration,
    fromPrice: false,
    discount: discountAmount,
    promotionCode: promoCode || undefined,
  };

  const valid = [
    chosen.length > 0,
    artistValid,
    Boolean(date && slotValid),
    Boolean(details.name && details.phone && details.email),
  ];
  const firstInvalid = valid.findIndex((value) => !value);
  const maxReached = firstInvalid === -1 ? 4 : firstInvalid;

  function goTo(next) {
    setStep(next);
    setError("");
    setSummaryOpen(false);
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }

  function toggleService(id) {
    const next = serviceIds.includes(id)
      ? serviceIds.filter((item) => item !== id)
      : [...serviceIds, id];
    setServiceIds(next);
    setTime(null);
  }

  async function confirm() {
    if (submittingRef.current) return;

    if (!valid.every(Boolean)) {
      setError(
        "Một lựa chọn không còn hợp lệ. Vui lòng kiểm tra lại dịch vụ, nhân viên và giờ hẹn.",
      );
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const sIds = serviceIds.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0);

      let selectedStaff = null;
      if (artistId && artistId !== "any") {
        selectedStaff = staff.find((s) => String(s.id) === String(artistId));
      }
      const stId = artistId === "any" ? null : (selectedStaff?.id ? Number(selectedStaff.id) : Number(artistId));

      const timeStr = time ? (time.length === 5 ? `${time}:00` : time) : "09:00:00";
      const startMinVal = (parseInt(timeStr.slice(0, 2), 10) * 60) + parseInt(timeStr.slice(3, 5), 10);
      const endMinVal = startMinVal + duration;
      const endHH = String(Math.floor(endMinVal / 60)).padStart(2, "0");
      const endMM = String(endMinVal % 60).padStart(2, "0");
      const timeEndStr = `${endHH}:${endMM}:00`;

      const bookingCode = generateBookingCode();
      const targetCustomerId = customer?.id ? Number(customer.id) : null;
      const subTotal = price;
      const discount = discountAmount || 0;
      const finalTotal = Math.max(0, subTotal - discount);

      const backendAppointment = await appointmentService.create({
        bookingCode,
        staffId: stId,
        customerId: targetCustomerId,
        customerName: details.name || customer?.name || "",
        customerPhone: details.phone || customer?.phone || "",
        customerEmail: details.email || customer?.email || "",
        couponId: couponId ? Number(couponId) : null,
        appointmentDate: date,
        timeStart: timeStr,
        timeEnd: timeEndStr,
        totalDuration: duration,
        price: subTotal,
        subTotal: subTotal,
        discountAmount: discount,
        totalAmount: finalTotal,
        status: "PENDING",
        note: details.note || "",
        serviceIds: sIds,
      });

      const finalCode = backendAppointment?.bookingCode || bookingCode;
      router.push(`/booking/success?code=${finalCode}`);
    } catch (apiError) {
      console.error("Booking submission error:", apiError);
      setError(
        apiError?.response?.data?.message ||
        apiError?.message ||
        "Không thể đặt lịch trên máy chủ. Vui lòng thử lại.",
      );
      setSubmitting(false);
      submittingRef.current = false;
    }
  }

  const heading = HEADINGS[step];

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-ivory/95 backdrop-blur-xl">
        <div className="gutter flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            className="shrink-0 font-display text-[1.375rem] leading-none"
          >
            VELA.
          </Link>
          <div className="flex min-w-0 flex-1 justify-center lg:flex-none">
            <BookingStepper
              current={step}
              maxReached={maxReached}
              onJump={goTo}
            />
          </div>
          <Link
            href="/"
            aria-label="Thoát đặt lịch"
            className="shrink-0 p-2 text-ink/45"
          >
            <X className="size-4" />
          </Link>
        </div>
      </header>

      <main className="gutter flex-1 pb-44 pt-10 md:pt-16">
        <div className="mb-10 flex items-baseline gap-4 md:mb-14">
          <span className="eyebrow tabular text-champagne">
            {pad2(step + 1)}
          </span>
          <div>
            <h1 className="font-display text-d2 font-light leading-tight">
              {heading.title}
            </h1>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink/55">
              {heading.sub}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            {step === 0 && (
              <>
                <div className="hide-scrollbar mb-8 flex gap-2 overflow-x-auto pb-2">
                  {[
                    { slug: "all", name: "Tất cả" },
                    ...categories.filter((item) => item.active),
                  ].map((item) => (
                    <button
                      key={item.slug}
                      type="button"
                      aria-pressed={category === item.slug}
                      onClick={() => setCategory(item.slug)}
                      className={cn(
                        "shrink-0 border px-4 py-3 text-[0.8125rem] transition-colors",
                        category === item.slug
                          ? "border-ink bg-ink text-ivory"
                          : "border-ink/20 text-ink/60 hover:border-ink",
                      )}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>

                {services.length === 0 ? (
                  <div className="border border-dashed border-ink/15 px-6 py-16 text-center">
                    <p className="text-[0.9375rem] text-ink/60">
                      Chưa có dịch vụ nào trên hệ thống máy chủ. Vui lòng kiểm tra lại dữ liệu.
                    </p>
                  </div>
                ) : (
                  <>
                    <StepTreatments
                      services={services.filter(
                        (item) =>
                          category === "all" || item.categorySlug === category,
                      )}
                      selected={serviceIds}
                      onToggle={toggleService}
                    />
                    {!services.some(
                      (item) =>
                        category === "all" || item.categorySlug === category,
                    ) && (
                      <p className="py-12 text-center text-ink/50">
                        Danh mục này chưa có dịch vụ đang hoạt động. Vui lòng chọn danh mục khác.
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {step === 1 && (
              <StepArtist
                artists={artists}
                value={artistId}
                unavailable={[]}
                onChange={(id) => {
                  setArtistId(id);
                  setTime(null);
                }}
              />
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-6">
                  <p className="eyebrow mb-5 text-ink/40">Chọn ngày</p>
                  <DatePicker
                    value={date}
                    onChange={(nextDate) => {
                      setDate(nextDate);
                      setTime(null);
                    }}
                  />
                </div>
                <div className="lg:col-span-6">
                  <p className="eyebrow mb-5 text-ink/40">Chọn giờ</p>
                  <TimeSlotPicker
                    slots={slots}
                    value={time}
                    onChange={setTime}
                    duration={duration}
                  />
                  {date && chosen.length > 0 && !slots.some((slot) => slot.available) && (
                    <WaitlistInvite
                      serviceId={chosen[0]?.id}
                      staffId={artistId}
                      date={date}
                      defaults={{
                        name: details?.name,
                        phone: details?.phone,
                        email: details?.email,
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-xl">
                <StepDetails
                  value={details}
                  defaultValues={details}
                  onChange={setDetails}
                  onSubmit={(values) => {
                    setDetails(values);
                    goTo(4);
                  }}
                  submitting={submitting}
                />
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="space-y-8 lg:col-span-7">
                  <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <dt className="eyebrow text-ink/40">Khách hàng</dt>
                      <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">
                        {details.name}
                      </dd>
                    </div>
                    <div>
                      <dt className="eyebrow text-ink/40">Số điện thoại</dt>
                      <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">
                        {details.phone}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="eyebrow text-ink/40">Email</dt>
                      <dd className="mt-1.5 text-[0.9375rem] font-medium text-ink">
                        {details.email}
                      </dd>
                    </div>
                    {details.note && (
                      <div className="sm:col-span-2">
                        <dt className="eyebrow text-ink/40">Ghi chú</dt>
                        <dd className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink/70">
                          {details.note}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <PromoField
                    services={chosen}
                    date={date}
                    value={promoCode}
                    discount={discountAmount}
                    onChange={(code, discount, cId) => {
                      setPromoCode(code);
                      setDiscountAmount(Number(discount) || 0);
                      setCouponId(cId || null);
                    }}
                  />

                  <p className="mt-7 border-l border-champagne pl-4 text-[0.875rem] leading-relaxed text-ink/60">
                    Yêu cầu được tạo ở trạng thái{" "}
                    <strong className="font-medium text-ink">
                      Chờ xác nhận
                    </strong>
                    . Salon sẽ liên hệ để xác nhận lịch hẹn của bạn.
                  </p>

                  <div className="mt-7 flex flex-wrap gap-5">
                    <button
                      type="button"
                      onClick={() => goTo(0)}
                      className="text-[0.8125rem] underline underline-offset-4"
                    >
                      Đổi dịch vụ
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(1)}
                      className="text-[0.8125rem] underline underline-offset-4"
                    >
                      Đổi nhân viên
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(2)}
                      className="text-[0.8125rem] underline underline-offset-4"
                    >
                      Đổi ngày và giờ
                    </button>
                  </div>
                </div>

                <aside className="lg:col-span-5">
                  <BookingSummary model={summary} />
                </aside>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div
            role="alert"
            className="mt-6 border-l border-rose-500 bg-rose-50/50 p-4 text-[0.875rem] text-rose-600"
          >
            {error}
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        {summaryOpen && (
          <div className="gutter max-h-[45dvh] overflow-y-auto py-5 lg:hidden">
            <BookingSummary model={summary} className="border-0 p-0" />
          </div>
        )}
        <div className="gutter flex flex-wrap items-center justify-between gap-3 py-3">
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || submitting}
            aria-label="Quay lại bước trước"
            className="eyebrow inline-flex min-h-11 items-center gap-2 text-ink/55 disabled:opacity-25"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>

          <button
            type="button"
            aria-expanded={summaryOpen}
            onClick={() => setSummaryOpen(!summaryOpen)}
            className="text-[0.8125rem] tabular text-ink/70 lg:hidden"
          >
            {chosen.length} dịch vụ · {currency(Math.max(0, price - discountAmount))}
          </button>

          {step === 3 ? (
            <button
              type="submit"
              form="booking-details"
              className="eyebrow inline-flex min-h-11 items-center gap-2 bg-ink px-6 text-ivory transition-opacity hover:bg-champagne hover:text-void"
            >
              Tiếp tục
              <ArrowRight className="size-4" />
            </button>
          ) : step < 4 ? (
            <button
              type="button"
              onClick={() => goTo(step + 1)}
              disabled={!valid[step]}
              className="eyebrow inline-flex min-h-11 items-center gap-2 bg-ink px-6 text-ivory transition-opacity disabled:opacity-25"
            >
              Tiếp tục
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={confirm}
              disabled={submitting}
              className="eyebrow inline-flex min-h-11 items-center gap-2 bg-ink px-7 text-ivory transition-opacity disabled:opacity-50"
            >
              {submitting ? "Đang gửi yêu cầu…" : "Gửi yêu cầu đặt lịch"}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
