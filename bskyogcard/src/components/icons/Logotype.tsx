import React from 'react'

export function Logotype({size, fill}: {size: number; fill?: string}) {
  return (
    <svg fill="none" viewBox="0 0 398 108" width={size}>
      <path
        fill={fill}
        d="M53.139 40.276c9.306 3.396 14.247 11.24 14.247 20.022 0 14.87-9.766 23.886-28.494 23.886H.632V.818h36.996c17.809 0 26.426 9.25 26.426 21.544 0 8.196-3.677 14.167-10.915 17.914Zm-16.66-26.462H16.143v21.779h20.336c7.928 0 12.179-4.215 12.179-11.24 0-6.44-4.366-10.539-12.179-10.539ZM16.143 71.07h21.945c8.732 0 13.442-4.098 13.442-11.474 0-7.728-4.48-11.592-13.442-11.592H16.143V71.07ZM88.892 84.184H74.415V.818h14.477v83.366ZM136.892 57.605V23.767h14.477v60.417h-14.017v-8.782c-4.481 6.791-10.686 10.187-18.613 10.187-12.524 0-20.681-7.728-20.681-21.778V23.767h14.476v37.585c0 7.61 3.677 11.474 11.145 11.474 7.009 0 13.213-5.268 13.213-15.22ZM217.264 55.03v3.512h-44.35c1.034 10.42 6.664 15.572 15.396 15.572 6.664 0 11.145-2.927 13.558-8.664h13.902c-3.102 12.294-13.443 20.139-27.575 20.139-8.847 0-15.97-2.927-21.37-8.665-5.4-5.737-8.158-13.347-8.158-22.949 0-9.484 2.643-17.094 8.043-22.949 5.4-5.737 12.409-8.664 21.256-8.664 8.961 0 16.085 3.044 21.37 9.016 5.285 5.971 7.928 13.933 7.928 23.651Zm-29.413-21.194c-7.928 0-13.443 4.684-14.822 14.402h29.758c-1.264-8.781-6.549-14.402-14.936-14.402ZM249.35 85.823c-17.234 0-26.311-6.908-27.115-20.841h14.132c.804 7.493 4.481 10.303 13.213 10.303 7.813 0 11.719-2.459 11.719-7.26 0-4.331-2.757-6.439-11.604-7.961l-6.779-1.17c-12.983-2.226-19.417-8.314-19.417-18.267 0-11.357 8.847-18.265 24.587-18.265 16.89 0 25.622 6.79 26.196 20.49H260.61c-.345-7.376-4.596-9.952-12.524-9.952-6.894 0-10.34 2.342-10.34 7.025 0 4.215 2.987 6.089 9.881 7.376l7.468 1.171c14.362 2.693 20.566 8.08 20.566 18.383 0 12.177-9.651 18.968-26.311 18.968ZM339.201 84.184h-16.545l-17.235-28.101-8.961 9.133v18.968h-14.247V.818h14.247v48.006l24.128-25.057h17.234l-22.405 22.832 23.784 37.585ZM378.008 38.988l4.826-15.221H398L375.136 89.1c-2.413 6.674-5.4 11.475-9.192 14.168-3.791 2.693-9.191 3.981-16.315 3.981-2.413 0-4.481-.117-6.319-.351V95.307h5.515c6.549 0 9.766-4.098 9.766-9.718 0-2.81-.919-6.908-2.758-12.177l-17.234-49.645h15.626l4.825 15.104c3.562 11.358 6.664 22.598 9.422 33.721 2.528-9.6 5.745-20.841 9.536-33.604Z"
      />
    </svg>
  )
}