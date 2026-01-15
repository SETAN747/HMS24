import React from "react";

const WeeklyAvailability = ({ profileData, setProfileData, isEdit }) => {
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const addSlot = (day) => {
    setProfileData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        weeklySchedule: {
          ...prev.availability.weeklySchedule,
          [day]: [
            ...(prev.availability.weeklySchedule?.[day] || []),
            { start: "10:00", end: "13:00" },
          ],
        },
      },
    }));
  };

  const updateSlot = (day, index, field, value) => {
    const updatedSlots = [
      ...profileData.availability.weeklySchedule[day],
    ];
    updatedSlots[index][field] = value;

    setProfileData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        weeklySchedule: {
          ...prev.availability.weeklySchedule,
          [day]: updatedSlots,
        },
      },
    }));
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
      
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Weekly Availability
        </h3>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
          Schedule
        </span>
      </div>

      {/* Horizontal Days */}
      <div className="space-y-4">
        {days.map((day) => (
          <div
            key={day}
            className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4"
          >
            {/* Day Column */}
            <div className="w-28 shrink-0">
              <p className="capitalize text-sm font-semibold text-gray-700">
                {day}
              </p>

              {isEdit && (
                <button
                  onClick={() => addSlot(day)}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  + Add
                </button>
              )}
            </div>

            {/* Slots Horizontal Scroll */}
            <div className="flex flex-1 gap-3 overflow-x-auto pb-1">
              {profileData.availability?.weeklySchedule?.[day]?.length > 0 ? (
                profileData.availability.weeklySchedule[day].map(
                  (slot, index) => (
                    <div
                      key={index}
                      className="min-w-[170px] rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                    >
                      {isEdit ? (
                        <>
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              updateSlot(day, index, "start", e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />

                          <p className="my-1 text-center text-xs text-gray-400">
                            to
                          </p>

                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              updateSlot(day, index, "end", e.target.value)
                            }
                            className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                          />
                        </>
                      ) : (
                        <p className="text-center text-sm font-medium text-gray-700">
                          {slot.start} – {slot.end}
                        </p>
                      )}
                    </div>
                  )
                )
              ) : (
                <p className="text-xs italic text-gray-400">
                  No slots
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Slot Duration */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm font-medium text-gray-700">
          Slot Duration
        </p>

        {isEdit ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={5}
              step={5}
              value={profileData.availability?.slotDuration || 15}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  availability: {
                    ...prev.availability,
                    slotDuration: Number(e.target.value),
                  },
                }))
              }
              className="w-20 rounded-lg border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <span className="text-xs text-gray-500">mins</span>
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-800">
            {profileData.availability?.slotDuration || 15} mins
          </span>
        )}
      </div>
    </div>
  );
};

export default WeeklyAvailability;
