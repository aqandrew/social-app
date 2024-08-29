import React from 'react'

import {style as s} from '../theme/index.js'
import {Image as ImageSource} from '../util/resolvePostData.js'

export type ImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'style'
> & {
  image: ImageSource
  cx?: Record<string, any>[]
}

export function Image({image, cx, ...rest}: ImageProps) {
  const {image: src, mime = 'image/jpeg'} = image
  return (
    <img
      {...rest}
      src={`data:${mime};base64,${src.toString('base64')}`}
      style={cx ? s(cx) : undefined}
    />
  )
}