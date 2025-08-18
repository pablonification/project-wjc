import Swal from "sweetalert2";

// Universal async confirmation modal. Returns boolean like window.confirm.
export function confirmDialog(message) {
  return Swal.fire({
    text: message,
    icon: "question",
    background: "#1F1F1F",
    color: "#fff",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
    buttonsStyling: false,
    customClass: {
      popup: "rounded-lg p-6 font-manrope",
      confirmButton: "bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2",
      cancelButton: "bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded",
    },
  }).then((res) => res.isConfirmed);
}
