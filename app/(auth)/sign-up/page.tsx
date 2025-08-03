import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUp 
          routing="hash"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card border-border shadow-2xl",
              
              // Header elements
              headerTitle: "text-foreground !text-white",
              headerSubtitle: "text-muted-foreground !text-gray-300",
              
              // Form field labels and text
              formFieldLabel: "!text-white",
              formFieldInput: "bg-input border-border text-foreground !text-white placeholder:!text-gray-400",
              formFieldInputShowPasswordButton: "!text-gray-300 hover:!text-white",
              
              // Buttons
              formButtonPrimary: "bg-primary text-primary-foreground hover:bg-accent !bg-orange-500 hover:!bg-orange-600",
              socialButtonsBlockButton: "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80 !text-white",
              socialButtonsBlockButtonText: "!text-white",
              
              // Links and footer
              footerActionLink: "text-primary hover:text-accent !text-orange-500 hover:!text-orange-400",
              footerActionText: "!text-gray-300",
              
              // Alternative method text
              alternativeMethodsBlockButton: "!text-white border-border hover:bg-secondary/20",
              alternativeMethodsBlockButtonText: "!text-white",
              
              // Divider text
              dividerText: "!text-gray-300",
              dividerLine: "!border-gray-600",
              
              // Error and help text
              formFieldErrorText: "!text-red-400",
              formFieldSuccessText: "!text-green-400",
              formFieldHintText: "!text-gray-400",
              
              // Other text elements
              identityPreviewText: "text-foreground !text-white",
              identityPreviewEditButtonIcon: "text-muted-foreground !text-gray-300",
              otpCodeFieldInput: "!text-white !bg-input",
              
              // Loading states
              spinner: "!text-orange-500",
            },
            layout: {
              socialButtonsPlacement: "bottom",
            },
          }}
        />
      </div>
    </main>
  )
}