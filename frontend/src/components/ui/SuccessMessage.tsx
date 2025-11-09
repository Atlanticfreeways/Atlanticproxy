interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessMessage = ({ message, onDismiss }: SuccessMessageProps) => {
  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-green-500 mr-2">✅</span>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-500 hover:text-green-700 ml-4"
        >
          ✕
        </button>
      )}
    </div>
  );
};