/**
 * 图片编辑对话框
 * 支持调整大小和裁切功能
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Modal, Slider, Button, Space, InputNumber, Row, Col, Divider } from 'antd';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditDialogProps {
  visible: boolean;
  imageFile: File | null;
  onConfirm: (editedFile: File) => void;
  onCancel: () => void;
}

export function ImageEditDialog({ visible, imageFile, onConfirm, onCancel }: ImageEditDialogProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(100);
  const [outputWidth, setOutputWidth] = useState<number>(0);
  const [outputHeight, setOutputHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectLocked, setAspectLocked] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // 加载图片
  useEffect(() => {
    if (imageFile && visible) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
      // 重置状态
      setCrop(undefined);
      setCompletedCrop(undefined);
      setScale(100);
    }
  }, [imageFile, visible]);

  // 图片加载完成后获取原始尺寸
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setOriginalWidth(naturalWidth);
    setOriginalHeight(naturalHeight);
    setOutputWidth(naturalWidth);
    setOutputHeight(naturalHeight);
  }, []);

  // 宽度变化时保持比例
  const handleWidthChange = (value: number | null) => {
    if (value && value > 0) {
      setOutputWidth(value);
      if (aspectLocked && originalWidth > 0) {
        const ratio = originalHeight / originalWidth;
        setOutputHeight(Math.round(value * ratio));
      }
    }
  };

  // 高度变化时保持比例
  const handleHeightChange = (value: number | null) => {
    if (value && value > 0) {
      setOutputHeight(value);
      if (aspectLocked && originalHeight > 0) {
        const ratio = originalWidth / originalHeight;
        setOutputWidth(Math.round(value * ratio));
      }
    }
  };

  // 生成编辑后的图片
  const generateEditedImage = useCallback(async (): Promise<File | null> => {
    if (!imgRef.current || !imageFile) return null;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 计算裁切区域（如果有）
    let sourceX = 0, sourceY = 0, sourceWidth = image.naturalWidth, sourceHeight = image.naturalHeight;
    
    if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0) {
      // 将显示坐标转换为原始图片坐标
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      sourceX = completedCrop.x * scaleX;
      sourceY = completedCrop.y * scaleY;
      sourceWidth = completedCrop.width * scaleX;
      sourceHeight = completedCrop.height * scaleY;
    }

    // 设置输出尺寸
    let finalWidth = outputWidth;
    let finalHeight = outputHeight;
    
    // 如果有裁切，按裁切区域的比例调整输出尺寸
    if (completedCrop && completedCrop.width > 0) {
      const cropRatio = sourceWidth / sourceHeight;
      if (aspectLocked) {
        finalHeight = Math.round(finalWidth / cropRatio);
      }
    }

    canvas.width = finalWidth;
    canvas.height = finalHeight;

    // 绘制图片
    ctx.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, finalWidth, finalHeight
    );

    // 转换为 Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = imageFile.name.replace(/\.[^.]+$/, '') + '_edited.jpg';
          resolve(new File([blob], fileName, { type: 'image/jpeg' }));
        } else {
          resolve(null);
        }
      }, 'image/jpeg', 0.9);
    });
  }, [imageFile, completedCrop, outputWidth, outputHeight, aspectLocked]);

  // 确认编辑
  const handleConfirm = async () => {
    const editedFile = await generateEditedImage();
    if (editedFile) {
      onConfirm(editedFile);
    }
  };

  // 重置为原始尺寸
  const handleReset = () => {
    setOutputWidth(originalWidth);
    setOutputHeight(originalHeight);
    setScale(100);
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <Modal
      title="编辑图片"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="reset" onClick={handleReset}>重置</Button>,
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm}>确认上传</Button>,
      ]}
    >
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={12}>
            <Space>
              <span>输出宽度:</span>
              <InputNumber
                min={10}
                max={4000}
                value={outputWidth}
                onChange={handleWidthChange}
                addonAfter="px"
              />
            </Space>
          </Col>
          <Col span={12}>
            <Space>
              <span>输出高度:</span>
              <InputNumber
                min={10}
                max={4000}
                value={outputHeight}
                onChange={handleHeightChange}
                addonAfter="px"
              />
            </Space>
          </Col>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Col span={24}>
            <Button 
              size="small" 
              type={aspectLocked ? 'primary' : 'default'}
              onClick={() => setAspectLocked(!aspectLocked)}
            >
              {aspectLocked ? '🔒 锁定比例' : '🔓 自由比例'}
            </Button>
          </Col>
        </Row>
      </div>

      <Divider>预览缩放: {scale}%</Divider>
      <Slider
        min={25}
        max={100}
        value={scale}
        onChange={setScale}
        style={{ marginBottom: 16 }}
      />

      <div style={{ 
        maxHeight: 400, 
        overflow: 'auto', 
        border: '1px solid #d9d9d9', 
        borderRadius: 4,
        padding: 8,
        background: '#f5f5f5'
      }}>
        {imageSrc && (
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="编辑预览"
              style={{ 
                maxWidth: '100%', 
                transform: `scale(${scale / 100})`,
                transformOrigin: 'top left'
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        )}
      </div>

      <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
        提示：拖动选择裁切区域，调整上方尺寸设置输出大小
      </div>
    </Modal>
  );
}
