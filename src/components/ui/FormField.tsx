import type { ReactNode } from 'react'

export interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`gl-field ${error ? 'gl-field--error' : ''} ${className}`}>
      <div className="gl-field__label-row">
        <label className="gl-field__label" htmlFor={htmlFor}>
          {label}
          {required && <span aria-hidden="true"> *</span>}
        </label>
        {hint && <span className="gl-field__hint">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="gl-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export type FieldInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function FieldInput({ className = '', ...props }: FieldInputProps) {
  return <input className={`gl-input ${className}`} {...props} />
}

export type FieldTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function FieldTextarea({ className = '', ...props }: FieldTextareaProps) {
  return <textarea className={`gl-input gl-textarea ${className}`} {...props} />
}

export interface FieldSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function FieldSelect({ className = '', children, ...props }: FieldSelectProps) {
  return (
    <select className={`gl-input gl-select ${className}`} {...props}>
      {children}
    </select>
  )
}
