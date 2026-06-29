import { useState } from 'react'

function Privacy() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <h1>Privacy Policy</h1>
      <h2>Data Collection and Use</h2>
      <h3>Information We Collect</h3>
      <p>
        We collect information that you provide to us when you use our services, such as your name and email address. None of this information is shared with third parties and is only used
        for the purpose of providing you with our services. We do not collect any sensitive information, such as financial or health data.
      </p>
    </>
  )
}

export default Privacy
