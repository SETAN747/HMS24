import { Doughnut } from "react-chartjs-2";
 

 

const StatusDoughnut = ({ counts }) => {
  const data = {
  labels: [
    "Pending",
    "Confirmed (Paid)",
    "Checked In",
    "In Consultation",
    "Completed",
    "No Show",
    "Cancelled by User",
    "Cancelled by Doctor",
    "Refunded",
  ],
  datasets: [
    {
      label: "Appointments",
      data: [
        counts.pending || 1,
        counts.confirmed || 2, // confirmed = paid
        counts.checked_in || 3,
        counts.in_consultation || 4,
        counts.completed || 5,
        counts.no_show || 6,
        counts.cancelled_by_user || 7,
        counts.cancelled_by_doctor || 8,
        counts.refunded || 9,
      ],
      backgroundColor: [
        "#FFC107", // Pending - yellow
        "#2196F3", // Confirmed (Paid) - blue
        "#9C27B0", // Checked In - purple
        "#00BCD4", // In Consultation - cyan
        "#4CAF50", // Completed - green
        "#9E9E9E", // No Show - grey
        "#F44336", // Cancelled by User - red
        "#E91E63", // Cancelled by Doctor - pink
        "#FF9800", // Refunded - orange
      ],
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 8,
    },
  ],
};

  const options = {
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    cutout: "70%", // donut thickness
    responsive: true,
  };

  return (
    <div className="flex justify-center items-center w-full h-[300px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default StatusDoughnut;
