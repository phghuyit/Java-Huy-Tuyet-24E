"use client";
import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Field, Input, Textarea } from "@/components/ui/field";
import { bookingDetailsSchema } from "@/lib/booking-schema";

export function StepDetails({
  value,
  defaultValues,
  onChange,
  onSubmit,
  submitting,
}) {
  const initialValues = {
    name: "",
    phone: "",
    email: "",
    note: "",
    ...(defaultValues || value || {}),
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = watch((formValues) => {
      if (typeof onChange === "function") {
        onChange(formValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleFormSubmit = (data) => {
    if (typeof onChange === "function") {
      onChange(data);
    }
    if (typeof onSubmit === "function") {
      onSubmit(data);
    }
  };

  return (
    <form
      id="booking-details"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-9"
      noValidate
    >
      <div className="grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2">
        <Field label="Họ và tên *" error={errors.name?.message}>
          <Input
            {...register("name")}
            autoComplete="name"
            placeholder="Nguyễn Minh Anh"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        <Field label="Số điện thoại *" error={errors.phone?.message}>
          <Input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="0901234567"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>

        <Field
          label="Email *"
          error={errors.email?.message}
          hint="Thông tin liên hệ của bạn cho buổi hẹn."
          className="sm:col-span-2"
        >
          <Input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="ban@example.com"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        <Field
          label="Ghi chú cho salon"
          error={errors.note?.message}
          hint="Mong muốn, tình trạng dị ứng hoặc lưu ý để salon chuẩn bị."
          className="sm:col-span-2"
        >
          <Textarea
            {...register("note")}
            rows={4}
            placeholder="Không bắt buộc"
            aria-invalid={Boolean(errors.note)}
          />
        </Field>
      </div>
    </form>
  );
}
