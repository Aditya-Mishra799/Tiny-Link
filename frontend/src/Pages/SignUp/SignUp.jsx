import React from 'react'
import { signUpSchema } from '../../validation-schema/authValidation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./SignUp.module.css"
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { NavLink } from 'react-router-dom';

const SignUp = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signUpSchema)
  })
  const onSubmit = (data) => console.log(data)
  return (
    <div className={styles.pageCnt}>
      <div className={styles.page}>
        <h1>Sign Up</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input {...register("name")} placeholder={"Enter your name"} label="Name" type="name" errorMessage={errors?.name?.message} id={"name"} />
          <Input {...register("email")} placeholder={"Enter your email"} label="Email" type="email" errorMessage={errors?.email?.message} id={"email"} />
          <Input {...register("password")} placeholder={"Enter your password"} label="Password" type="password" errorMessage={errors?.password?.message} id={"password"} />
          <Button type="submit">Submit</Button>
        </form>
        <span>Already have an account? <NavLink to={"/login"}>Login</NavLink> here</span>
      </div>

    </div>
  )
}

export default SignUp