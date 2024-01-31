import { useState } from 'react';
import { CameraAction } from '../../camera/camera';
import { Button } from '@/components/ui/button';
import { privateApi } from '@/api/axios';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Camera() {
  const navigate = useNavigate();
  const [isCameraOpen, setIsCameraOpen] = useState<Boolean>(false);
  const [cardImage, setCardImage] = useState<Blob>();
  const [file, setFile] = useState<File>();

  const { challenge_id } = useParams();

  async function query(file: File) {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/detr-resnet-50', {
      headers: { Authorization: import.meta.env.VITE_HUGGING_FACE_TOKEN },
      method: 'POST',
      body: file,
    });
    const result = await response.json();
    return result;
  }

  async function upload() {
    if (file) {
      const aiFile = await query(file);
      console.log('aifile >>>>>>', aiFile);
    }

    await privateApi({
      method: 'post',
      url: `http://3.34.122.205:3000/challengeAuth/${challenge_id}`,
      data: {
        filename: file?.name,
        type: file?.type,
      },
    }).then((res) => {
      console.log('res.data', res.data);
      if (res.data.msg) {
        alert(res.data.msg);
      } else {
        privateApi({
          method: 'put',
          url: res.data,
          data: file,
          headers: {
            'Content-Type': file?.type,
          },
        }).then((res) => {
          console.log(res);
          alert('업로드 완료!');
          navigate(`/challengeInProgress/${challenge_id}`);
        });
      }
    });
  }

  return (
    <>
      <div className="flex-col align-middle">
        <div>
          {!cardImage && isCameraOpen && (
            <CameraAction
              onCapture={(blob: Blob) => {
                setCardImage(blob);
                console.log('blob', blob);
                setFile(new File([blob], 'image.png', { type: blob.type }));
              }}
              onClear={() => setCardImage(undefined)}
            />
          )}
        </div>

        {cardImage && (
          <div className="m-auto">
            {/* <h2>미리보기</h2> */}

            <img className="absolute" src={cardImage && URL.createObjectURL(cardImage)} />

            <div className="absolute">
              <Button
                onClick={() => {
                  setIsCameraOpen(true);
                  setCardImage(undefined);
                }}
              >
                다시 찍기
              </Button>
              <Button onClick={upload}>업로드</Button>
            </div>
          </div>
        )}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center align-middle">
          <Button onClick={() => setIsCameraOpen(true)}>Open Camera</Button>
          <Button
            onClick={() => {
              setIsCameraOpen(false);
              setCardImage(undefined);
              console.log(isCameraOpen);
            }}
          >
            Close Camera
          </Button>
        </div>
      </div>
    </>
  );
}

export default Camera;
