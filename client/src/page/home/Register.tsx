import axios from '@/api/axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { setHeaderInfo } from '@/store/headerSlice';

import { useEffect, useState } from 'react';
import Cta from '@/components/Cta';

interface RegisterForm {
  name: string;
  userid: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  profilePic?: FileList;
}

const schema = yup
  .object({
    name: yup
      .string()
      .required('* 이름은 필수입니다.')
      .min(2, '이름은 2글자 이상 8글자 이하로 작성해주세요.')
      .max(8, '이름은 2글자 이상 8글자 이하로 작성해주세요.')
      .matches(/^[가-힣]+$/, '* 이름은 한글로만 작성해주세요.'),

    userid: yup
      .string()
      .required('* 아이디는 필수입니다.')
      .min(5, '아이디는 5글자 이상 12글자 이하로 작성해주세요')
      .max(12, '아이디는 5글자 이상 12글자 이하로 작성해주세요.')
      .matches(/^[A-Za-z0-9_]{5,12}$/, '아이디는 숫자, 영문으로만 작성 가능합니다.'),

    nickname: yup
      .string()
      .required('* 닉네임은 필수입니다.')
      .min(2, '닉네임은 2글자 이상 10글자 이하로 작성해주세요.')
      .max(10, '닉네임은 2글자 이상 10글자 이하로 작성해주세요.')
      .matches(/^[A-Za-z0-9가-힣]{2,12}$/, '닉네임은 영어, 한글, 포함하여 작성해주세요.'),

    password: yup
      .string()
      .required('* 비밀번호는 필수입니다.')
      .min(8, '최소 8자 이상 16자 이하로 작성해주세요.')
      .max(16, '최대 8자 이상 16자 이하로 작성해주세요.')
      .matches(
        /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()])[a-zA-Z0-9!@#$%^&*()]{8,16}$/,
        '비밀번호는 영어, 숫자, 특수문자로 작성해주세요.',
      ),

    confirmPassword: yup
      .string()
      .required('* 비밀번호는 필수입니다.')
      .oneOf([yup.ref('password')], '비밀번호가 일치하지 않습니다'),
  })
  .required();

export default function Register() {
  const [profilePic, setProfilePic] = useState<File>();
  const [idCheckMessage, setIdCheckMessage] = useState('');
  const [isIdAvailable] = useState(false);
  let fileUrl = '';
  let fileName = '';

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: yupResolver(schema),
    mode: 'onChange', // 폼 필드가 변경될 때마다 유효성 검사를 수행
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'userid') {
        const userid = value.userid;
        // 아이디 중복 검사 로직 수행
        axios
          .post('/checkid', { userid })
          .then((res) => {
            if (res.data.msg !== '사용가능한 아이디입니다.') {
              setError('userid', {
                type: 'manual',
              });
              setIdCheckMessage('이미 존재하는 아이디입니다.');
            } else {
              clearErrors('userid');
              setIdCheckMessage('사용가능한 아이디입니다.');
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setError, clearErrors]);

  useEffect(() => {
    dispatch(setHeaderInfo({ title: '회원가입', backPath: '/' }));
  }, [dispatch]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setProfilePic(e.target.files![0]);
  }

  const onSubmit = async (form: RegisterForm) => {
    // 아이디 중복 검사가 완료되었는지, 그리고 아이디가 사용 가능한지 확인
    if (!isIdAvailable) {
      alert('아이디 중복 검사를 확인해주세요.');
      return;
    }
    await axios({
      method: 'post',
      url: '/profileUpload/normal',
      data: {
        filename: profilePic?.name,
        type: profilePic?.type,
      },
    }).then((res) => {
      if (res.data !== '') {
        fileUrl = res.data;

        const regex = /\/([^/?#]+)[^/]*$/;
        const match = fileUrl.match(regex);

        // 추출된 파일 이름 출력
        if (match && match[1]) {
          fileName = match[1];
        }

        axios({
          method: 'put',
          url: res.data,
          data: profilePic,
          headers: {
            'Content-Type': profilePic?.type,
          },
        });
      }
      try {
        axios({
          method: 'post',
          url: '/register/normal',
          data: {
            name: form.name,
            userid: form.userid,
            nickname: form.nickname,
            password: form.password,
            profile_img: fileName,
          },
        });
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } catch (err) {
        alert('회원가입 실패');
        console.error('회원가입 실패:', err);
      }
    });
  };
  // const duplicateCheck = async (userid: string) => {
  //   if (!userid) return; // userid가 비어있으면 검사하지 않음

  //   console.log('input 값>>>>', userid);
  //   try {
  //     const res = await axios.post('/checkid', { userid });
  //     setIdCheckMessage(res.data.msg);
  //     setIsIdAvailable(res.data.msg === '사용가능한 아이디입니다.');
  //   } catch (err) {
  //     console.error(err);
  //     setIdCheckMessage('아이디 중복 검사 중 오류가 발생했습니다.');
  //     setIsIdAvailable(false);
  //   }
  // };

  return (
    <div className="flex justify-center">
      <form
        // onSubmit={handleSubmit(onSubmit)}
        className="mt-4 flex max-w-sm flex-col items-center justify-center gap-4"
      >
        <h1 className="w-full">회원가입</h1>
        <span className="w-full text-gray-500">
          반가워요!
          <br />
          그래빗과 함께 습관을 길러봐요
        </span>
        <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="name">
            이름
          </Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="mt-10 flex  w-full max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="userid">
            아이디
          </Label>
          <Input id="userid" {...register('userid')} />
          {errors.userid && <p className="text-xs text-red-500">{errors.userid.message}</p>}
          {/* <button onClick={duplicateCheck}>아이디 중복검사</button> */}
          <p className={`text-xs ${isIdAvailable ? 'text-green-500' : 'text-red-500'}`}>{idCheckMessage}</p>
        </div>
        <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="profile_img">
            프로필 사진
          </Label>
          <Input type="file" id="profile_img" onChange={handleFile} />
        </div>
        <div className="mt-10 flex w-full max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="nickname">
            닉네임
          </Label>
          <Input id="nickname" {...register('nickname')} />
          {errors.nickname && <p className="text-xs text-red-500">{errors.nickname.message}</p>}
        </div>
        <div className="mt-10 flex  w-full max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="password">
            비밀번호
          </Label>
          <Input type="password" id="password" {...register('password')} />
          {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="mt-10 flex w-full  max-w-sm flex-col items-center gap-4">
          <Label className="flex w-full" htmlFor="confirmPassword">
            비밀번호 확인
          </Label>
          <Input type="password" id="confirmPassword" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>
        {/* <Button type="submit">회원가입</Button> */}
        <Cta text={'회원가입'} onclick={handleSubmit(onSubmit)} />
      </form>
    </div>
  );
}
