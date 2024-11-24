import Swal from 'sweetalert2';

export const confirmationDialog = async ({ title = 'Are you sure?', text = 'You won\'t be able to revert this!', confirmButtonText = 'Yes, confirm!', cancelButtonText = 'Cancel' }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText,
    cancelButtonText,
  });

  return result.isConfirmed; // Returns true if user confirmed
};
