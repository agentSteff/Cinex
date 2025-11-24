import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "bg-zinc-900 border-yellow-500/20 text-white",
          title: "text-white",
          description: "text-gray-400",
          actionButton: "bg-yellow-500 text-black",
          cancelButton: "bg-zinc-800 text-gray-300",
          error: "bg-red-900/50 border-red-500/30",
          success: "bg-green-900/50 border-green-500/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
