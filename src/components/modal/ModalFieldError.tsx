type ModalFieldErrorProps = {
  message?: string;
};

export default function ModalFieldError({ message }: ModalFieldErrorProps) {
  if (!message) return null;

  return (
    <p className="text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}
