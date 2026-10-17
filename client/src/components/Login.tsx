import { useEffect, useState } from "react"
import SoftBackdop from "./SoftBackdop"
import { useAuth } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

const Login = () => {
    const [state, setState] = useState<"login" | "register">("login")
    const [loading, setLoading] = useState(false)
    const { user, login, signUp } = useAuth()

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        if (state === "login") {
            await login({ email: formData.email, password: formData.password })
        } else {
            await signUp(formData)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (user) {
            navigate('/')
        }
    }, [user, navigate])

    const inputWrapper =
        "flex items-center w-full bg-slate-900/60 ring-1 ring-slate-800 focus-within:ring-2 focus-within:ring-pink-600 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all"
    const input =
        "w-full bg-transparent text-white placeholder-slate-500 border-none outline-none"

    return (
        <>
            <SoftBackdop />
            <div className="min-h-screen flex items-center justify-center px-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full sm:w-87.5 text-center bg-slate-950 border border-slate-800 rounded-2xl px-8"
                >
                    <h1 className="text-white text-3xl mt-10 font-medium">
                        {state === "login" ? "Login" : "Sign up"}
                    </h1>

                    <p className="text-slate-400 text-sm mt-2">
                        {state === "login" ? "Please sign in to continue" : "Create an account to get started"}
                    </p>

                    {state === "register" && (
                        <div className={`${inputWrapper} mt-6`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pink-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="8" r="5" />
                                <path d="M20 21a8 8 0 0 0-16 0" />
                            </svg>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                className={input}
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className={`${inputWrapper} mt-4`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pink-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                        </svg>
                        <input
                            type="email"
                            name="email"
                            placeholder="Email id"
                            className={input}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={`${inputWrapper} mt-4`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pink-600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            className={input}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mt-4 text-left">
                        <button
                            type="button"
                            className="text-sm text-pink-600 hover:text-pink-700 hover:underline transition"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full h-11 rounded-full text-white font-medium bg-pink-600 hover:bg-pink-700 transition disabled:opacity-60"
                    >
                        {loading ? "Please wait..." : state === "login" ? "Login" : "Sign up"}
                    </button>

                    <p
                        onClick={() => setState(prev => (prev === "login" ? "register" : "login"))}
                        className="text-slate-400 text-sm mt-3 mb-11 cursor-pointer"
                    >
                        {state === "login" ? "Don't have an account?" : "Already have an account?"}
                        <span className="text-pink-600 hover:text-pink-700 hover:underline ml-1">click here</span>
                    </p>
                </form>
            </div>
        </>
    )
}

export default Login