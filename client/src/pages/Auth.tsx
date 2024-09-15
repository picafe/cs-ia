import { Avatar, Button, Center, PasswordInput, SegmentedControl, Stack, TextInput } from "@mantine/core";
import Logo from "../icons/Logo";
import { useEffect, useState } from "react";
import { IconCheck, IconLogin, IconSchool, IconUser, IconUserPlus, IconX } from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";

function PasswordRequirementLabel({ check, label }: { check: boolean, label: string }) {
    return (
        <div className="flex items-center gap-2">
            {check ? <IconCheck className="size-5" color="teal" /> : <IconX className="size-5" color="red" />}
            <span>{label}</span>
        </div>
    );
}

export default function Auth() {
    const navigate = useNavigate();
    let location = useLocation();
    const [selected, setSelected] = useState("login");

    useEffect(() => {
        if (location.pathname === '/login') setSelected('login');
        else setSelected('signup');
    }, [location]);

    const handleNavChange = (value: string) => {
        setSelected(value);
        if (value === "login") navigate('/login');
        else navigate('/signup');
    };

    const loginForm = useForm({
        initialValues: {
            email: '',
            password: '',
        },

        validate: {
            email: (val) => (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(val) ? null : 'Invalid email'),
            password: (val) => (val.length <= 8 && /[0-9]/.test(val) && /[a-z]/.test(val) && /[A-Z]/.test(val) && /[$&+,:;=?@#|'<>.^*()%!-]/.test(val) ? 'Password does not meet the requirements' : null),
        },
    });

    const signupForm = useForm({
        initialValues: {
            accountType: '',
            email: '',
            name: '',
            password: '',
            confirmPassword: '',
        },

        validate: {
            email: (val) => (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(val) ? null : 'Invalid email entered'),
            password: (val) => (val.length <= 8 && /[0-9]/.test(val) && /[a-z]/.test(val) && /[A-Z]/.test(val) && /[$&+,:;=?@#|'<>.^*()%!-]/.test(val) ? null : 'Password does not meet the requirements'),
            confirmPassword: (val): string | null => (val === signupForm.values.password ? null : 'Passwords do not match'),
        },
    });

    const passwordRequirements = [
        { check: signupForm.values.password.length >= 8, label: "At least 8 characters" },
        { check: /[a-z]/.test(signupForm.values.password), label: "Has a lowercase character" },
        { check: /[A-Z]/.test(signupForm.values.password), label: "Has an uppercase character" },
        { check: /[0-9]/.test(signupForm.values.password), label: "Has a number" },
        { check: /[$&+,:;=?@#|'<>.^*()%!-]/.test(signupForm.values.password), label: "Has a special character" },
    ];

    const setName = (email: string) => {
        if (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(email)) {
            if (/^\d+$/.test(email.split('@')[0].split('.').join(' ').slice(-1)))
                signupForm.setFieldValue('name', email.split('@')[0].split('.').map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(' ').slice(0, -1));
            else
                signupForm.setFieldValue('name', email.split('@')[0].split('.').map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(' '));
        }
        else if (email === '') signupForm.setFieldValue('name', '');
        else signupForm.setFieldValue('name', 'Invalid Email Entered');
    };

    const setEmail = (email: string) => {
        if (/^\S+\.+\S+@tdsb\.on\.ca+$/.test(email)) 
            signupForm.setFieldValue('accountType', 'teacher');
        else if (/^\S+\.+\S+@student\.tdsb\.on\.ca+$/.test(email))
            signupForm.setFieldValue('accountType', 'student');
        else
            signupForm.setFieldValue('accountType', '');
        signupForm.setFieldValue('email', email);    
    }

    const setAvatar = (name: string) => {
        if (name === '')
            return <Avatar color="gray" size={30}> ? </Avatar>
        else if (name === 'Invalid Email Entered')
            return <Avatar color="red" size={30}> ERR </Avatar>
        else
            return <Avatar color="cyan" size={30}> {name.split(" ").map((word) => word.charAt(0).toUpperCase())} </Avatar>

    }

    return (
        <div className="flex flex-row max-h-screen">
            <div className="w-2/5">
                <div className="h-full flex flex-col justify-center items-center p-16 overflow-y-scroll">
                    <div className="text-5xl font-bold w-full">
                        <h1 style={{ fontSize: "3rem" }}>Welcome to <br />
                            <span className="flex justify-center items-center mt-4">
                                <Logo size={48} /> LearnLog
                            </span>
                        </h1>
                    </div>
                    <div className="w-full">
                        <SegmentedControl fullWidth size="md" value={selected} onChange={(e) => handleNavChange(e)} data={[
                            {
                                value: 'login',
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconLogin className="size-4" />
                                        <span>Login</span>
                                    </Center>
                                ),
                            },
                            {
                                value: 'signup',
                                label: (
                                    <Center style={{ gap: 10 }}>
                                        <IconUserPlus className="size-4" />
                                        <span>Signup</span>
                                    </Center>
                                ),
                            },
                        ]} />
                    </div>
                    {selected === "login" ?
                        <form className="w-full text-left" onSubmit={loginForm.onSubmit((values) => console.log(values))}>
                            <Stack>
                                <TextInput
                                    required
                                    size="md"
                                    mt="md"
                                    value={loginForm.values.email}
                                    onChange={(event) => loginForm.setFieldValue('email', event.currentTarget.value.trim())}
                                    error={loginForm.errors.email && 'Invalid email entered'}
                                    rightSectionPointerEvents="none"
                                    rightSection={<IconUser className="size-5" />}
                                    label="Email"
                                    placeholder="Your email"
                                />
                                <PasswordInput
                                    required
                                    value={loginForm.values.password}
                                    onChange={(event) => loginForm.setFieldValue('password', event.currentTarget.value)}
                                    error={loginForm.errors.password && 'Password should include at least 6 characters'}
                                    size="md"
                                    label="Password"
                                    placeholder="Enter your password"
                                />

                                <Button type="submit" fullWidth size="md" variant="filled" color="#357c99">Login</Button>
                            </Stack>
                        </form>
                        :
                        <form className="w-full text-left" onSubmit={signupForm.onSubmit((values) => console.log(values))}>
                            <Stack >
                                <TextInput
                                    required
                                    size="md"
                                    mt="md"
                                    value={signupForm.values.email}
                                    onChange={(event) => setEmail(event.currentTarget.value.trim())}
                                    error={signupForm.errors.email && 'Invalid email entered'}
                                    rightSectionPointerEvents="none"
                                    rightSection={<IconSchool className="size-5" />}
                                    label="School Email"
                                    placeholder="Your email"
                                    onBlur={(e) => setName(e.target.value.trim())}

                                />
                                <TextInput
                                    required
                                    size="md"
                                    value={signupForm.values.name}
                                    onChange={(event) => signupForm.setFieldValue('name', event.currentTarget.value)}
                                    rightSection={setAvatar(signupForm.values.name.trim())}
                                    label="Your Name"
                                    description="This field is auto-filled based on your email."
                                    placeholder="Your name"

                                />
                                <PasswordInput
                                    required
                                    value={signupForm.values.password}
                                    onChange={(event) => signupForm.setFieldValue('password', event.currentTarget.value)}
                                    error={signupForm.errors.password && 'Password does not meet the requirements'}
                                    size="md"
                                    label="Password"
                                    placeholder="Enter your password"
                                />

                                <div className="flex flex-col gap-1">
                                    {passwordRequirements.map((req) => (
                                        <PasswordRequirementLabel key={req.label} check={req.check} label={req.label} />
                                    ))}
                                </div>

                                <PasswordInput
                                    required
                                    value={signupForm.values.confirmPassword}
                                    onChange={(event) => signupForm.setFieldValue('confirmPassword', event.currentTarget.value)}
                                    error={signupForm.errors.confirmPassword && 'Passwords do not match'}
                                    size="md"
                                    label="Confirm Password"
                                    placeholder="Confirm your password"
                                />
                                <Button type="submit" onClick={() => signupForm.setFieldValue('name', signupForm.values.name.trim())} fullWidth size="md" variant="filled" color="#357c99">Sign up</Button>
                            </Stack>
                        </form>
                    }
                </div>

            </div>

            <div className="w-3/5 overflow-hidden">
                <img src="/pawel-czerwinski-rRJmwU2R1Kk-unsplash.jpg" loading="eager" alt="abstract green 3D render" className="object-cover w-full" />
            </div>

        </div>
    )
}