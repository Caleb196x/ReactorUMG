import * as React from 'react';
import food_img from './food.png'

const CustomImage = ({
  src,
  alt = '',
  width,
  height,
  loading = 'lazy' as 'lazy' | 'eager',
  srcSet,
  sizes,
  crossOrigin,
  referrerPolicy,
  useMap,
  decoding,
  align,
  longDesc,
  style,
  className,
  title,
  onError,
  onLoad,
  ...props
}: {
  src: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  loading?: 'lazy' | 'eager';
  srcSet?: string;
  sizes?: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  useMap?: string;
  isMap?: boolean;
  decoding?: 'async' | 'auto' | 'sync';
  align?: string;
  longDesc?: string;
  style?: React.CSSProperties;
  className?: string;
  title?: string;
  onError?: React.ReactEventHandler<HTMLImageElement>;
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  [key: string]: any;
}) => {
  // 支持不同类型的图片源
  const imageSources = {
    jpg: src.endsWith('.jpg') || src.endsWith('.jpeg'),
    png: src.endsWith('.png'),
    gif: src.endsWith('.gif'),
    svg: src.endsWith('.svg'),
  };

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      srcSet={srcSet}
      sizes={sizes}
      crossOrigin={crossOrigin}
      referrerPolicy={referrerPolicy}
      useMap={useMap}
      // isMap={isMap}
      style={{ ...style, objectFit: 'cover', textAlign: 'center' }} // Use CSS for alignment
      className={className}
      title={title}
      onError={onError}
      onLoad={onLoad}
      {...props}
    />
  );
};

const App = () => {
  return (
    <div style={{flexDirection: 'column', alignItems: 'center'}}>
      <h1>React Image Example</h1>
      <div style={{ maxWidth: '500px' }}>
        <CustomImage
          src="https://picsum.photos/600/400"
          alt="Placeholder Image"
          width="200"
          height="150"
          loading="lazy"
          title="Example Image"
          style={{ borderRadius: '10px', border: '2px solid #ccc' }}
          onError={(e) => { console.log(e); (e.target as HTMLImageElement).src = 'https://picsum.photos/600/400'; }}
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <CustomImage
          src="https://www.w3.org/Icons/WWW/w3c_home"
          alt="SVG Logo"
          width="200"
          height="150"
          style={{ borderRadius: '50%' }}
          className="logo-image"
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <CustomImage
          src="/Game/Examples/Images/Test.Test"
          alt="SVG Logo"
          width="200"
          height="150"
          style={{ borderRadius: '50%' }}
          className="logo-image"
        />
      </div>
      <div style={{ marginTop: '20px' }}>
        <CustomImage
          src={food_img}
          alt="Food Image"
          width="200"
          height="150"
          style={{ borderRadius: '50%' }}
          className="logo-image"
        />
      </div>
    </div>
  );
};

export default App;
