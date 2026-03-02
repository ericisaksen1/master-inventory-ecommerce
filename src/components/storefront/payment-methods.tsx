import type { ComponentColorProps } from "@/lib/component-colors"
import { sectionColorStyle, headlineColorStyle, textColorStyle } from "@/lib/component-colors"

interface PaymentMethodsProps extends ComponentColorProps {
  heading: string
}

export function PaymentMethods({ heading, bgColor, headlineColor, textColor }: PaymentMethodsProps) {
  return (
    <section className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900" style={sectionColorStyle({ bgColor })}>
      <div className="container-homepage px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-gray-100" style={headlineColorStyle(headlineColor)}>
          {heading}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <span className="text-lg font-bold text-blue-700">V</span>
            </div>
            <h3 className="mt-4 font-semibold">Venmo</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" style={textColorStyle(textColor)}>
              Pay instantly with your Venmo account
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-lg font-bold text-green-700">$</span>
            </div>
            <h3 className="mt-4 font-semibold">Cash App</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" style={textColorStyle(textColor)}>
              Send payment via Cash App
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <span className="text-lg font-bold text-orange-700">B</span>
            </div>
            <h3 className="mt-4 font-semibold">Bitcoin</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" style={textColorStyle(textColor)}>
              Pay with Bitcoin from any wallet
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
