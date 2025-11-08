// components/AppointmentFormModal.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Dialog } from "@headlessui/react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const phoneRegex = /^[6-9]\d{9}$/; // India 10-digit starting 6-9

const schema = yup.object({
  patientName: yup.string().trim().required("Name is required"),
  age: yup
    .number()
    .typeError("Age must be a number")
    .required("Age is required")
    .min(0, "Invalid age")
    .max(120, "Invalid age"),
  gender: yup.string().required("Gender is required"),
  mobile: yup
    .string()
    .required("Mobile number is required")
    .matches(phoneRegex, "Enter a valid 10-digit mobile number"),
  bloodGroup: yup
    .string()
    .oneOf(
      ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
      "Invalid blood group"
    )
    .nullable(),
  emergencyName: yup.string().nullable(),
  emergencyContact: yup
    .string()
    .nullable()
    .test(
      "emergency-format",
      "Enter a valid 10-digit emergency contact number",
      (val) => {
        if (!val) return true; // optional
        return phoneRegex.test(val);
      }
    ),
  symptoms: yup.string().nullable(),
  mode: yup.string().required("Select consultation mode"),
});

const AppointmentFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    shouldUnregister: false,
    mode: "onTouched",
    defaultValues: {
      patientName: "",
      age: "",
      gender: "",
      mobile: "",
      bloodGroup: "",
      emergencyName: "",
      emergencyContact: "",
      symptoms: "",
      mode: "",
    },
  });

  const stepFields = {
    1: ["patientName", "age", "gender", "mobile"],
    2: ["symptoms", "mode", "bloodGroup", "emergencyName", "emergencyContact"],
    3: [], // final review - whole form validated on submit
  };

  const nextStep = async () => {
    const fieldsToValidate = stepFields[step] || [];
    const valid = await trigger(fieldsToValidate);
    console.log("trigger result for step", step, valid, "values:", getValues());
    if (valid) {
      setTimeout(() =>  setStep((s) => Math.min(3, s + 1)) , 50);
    } else {
      // focus first error? optional enhancement
      // const firstErr = Object.keys(errors)[0]; ...
    }
    console.log("👉 Going to Step:", step + 1);
    console.log("📦 Current Form Data:", watch());
    console.log("Unmounting Step", step);

   
  };
  const prevStep = () => {
    console.log("👈 Going Back to Step:", step - 1);
    console.log("Unmounting Step", step);
    setStep((prev) => prev - 1);
  };

  const submitForm = async (data) => {
    // final guard: ensure step is 3
    if (step < 3) {
      console.warn("Form submitted before confirmation — ignoring");
      return;
    }
    // call parent onSubmit with collected data
    await onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
          <Dialog.Title className="text-lg font-semibold text-gray-800">
            {step === 1
              ? "Patient Details"
              : step === 2
              ? "Health Information"
              : "Confirm Appointment"}
          </Dialog.Title>

          {/* small step indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className={`px-2 py-1 rounded ${
                step === 1 ? "bg-customPrimary text-white" : "bg-gray-100"
              }`}
            >
              1
            </div>
            <div
              className={`px-2 py-1 rounded ${
                step === 2 ? "bg-customPrimary text-white" : "bg-gray-100"
              }`}
            >
              2
            </div>
            <div
              className={`px-2 py-1 rounded ${
                step === 3 ? "bg-customPrimary text-white" : "bg-gray-100"
              }`}
            >
              3
            </div>
          </div>

          <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
            {step === 1 && (
              <>
                <input
                  {...register("patientName", { required: true })}
                  placeholder="Full Name"
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.patientName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.patientName.message}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="text-sm">Age</label>
                    <input
                      {...register("age", { required: true })}
                      type="number"
                      placeholder="Age"
                      className="w-full border rounded-lg px-3 py-2"
                    />
                    {errors.age && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.age.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm">Gender</label>
                    <select
                      {...register("gender")}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                </div> 
                <div className="mt-2">
                <label className="text-sm">Mobile</label>
                <input
                  {...register("mobile")}
                  placeholder="10-digit mobile number"
                  className="w-full border rounded-lg px-3 py-2"
                />
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile.message}</p>}
              </div>
              </>
            )}

            {step === 2 && (
              <>
                <textarea
                  {...register("symptoms")}
                  placeholder="Describe your symptoms"
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                /> 
                {errors.symptoms && <p className="text-xs text-red-500 mt-1">{errors.symptoms.message}</p>} 
                <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <label className="text-sm">Consultation Mode</label>
                  <select {...register("mode")} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select mode</option>
                    <option value="online">Online</option>
                    <option value="in-person">In-person</option>
                  </select>
                  {errors.mode && <p className="text-xs text-red-500 mt-1">{errors.mode.message}</p>}
                </div> 
                 <div>
                  <label className="text-sm">Blood Group (optional)</label>
                  <select {...register("bloodGroup")} className="w-full border rounded-lg px-3 py-2">
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodGroup && <p className="text-xs text-red-500 mt-1">{errors.bloodGroup.message}</p>}
                </div>
                </div> 
                 <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-sm">Emergency Contact Name (optional)</label>
                  <input {...register("emergencyName")} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm">Emergency Contact Number (optional)</label>
                  <input {...register("emergencyContact")} className="w-full border rounded-lg px-3 py-2" />
                  {errors.emergencyContact && <p className="text-xs text-red-500 mt-1">{errors.emergencyContact.message}</p>}
                </div>
              </div>
                 
              </>
            )}

            {step === 3 && (
               <div className="space-y-2">
                <p className="text-gray-700 text-sm"><strong>Name:</strong> {watch("patientName")}</p>
                <p className="text-gray-700 text-sm"><strong>Age:</strong> {watch("age")}</p>
                <p className="text-gray-700 text-sm"><strong>Gender:</strong> {watch("gender")}</p>
                <p className="text-gray-700 text-sm"><strong>Mobile:</strong> {watch("mobile")}</p>
                <p className="text-gray-700 text-sm"><strong>Blood Group:</strong> {watch("bloodGroup") || "—"}</p>
                <p className="text-gray-700 text-sm"><strong>Emergency:</strong> {watch("emergencyName") ? `${watch("emergencyName")} (${watch("emergencyContact")})` : "—"}</p>
                <p className="text-gray-700 text-sm"><strong>Symptoms:</strong> {watch("symptoms") || "—"}</p>
                <p className="text-gray-700 text-sm"><strong>Mode:</strong> {watch("mode")}</p>
                <p className="text-sm text-gray-500">Confirm to book your appointment.</p>
              </div>
            )}

            {/* Step Controls */}
            <div className="flex justify-between items-center pt-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 text-sm border rounded-lg"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto px-4 py-2 bg-customPrimary text-white rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit" 
                  disabled={isSubmitting}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                   {isSubmitting ? "Booking..." : "Confirm & Book"}
                </button>
              )}
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AppointmentFormModal;
