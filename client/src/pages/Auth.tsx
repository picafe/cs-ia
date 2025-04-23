import {
  Alert,
  Avatar,
  Button,
  Center,
  Loader,
  PasswordInput,
  SegmentedControl,
  Stack,
  TextInput,
} from "@mantine/core";
import Logo from "../icons/Logo";
import { useEffect, useState } from "react";
import {
  IconCheck,
  IconExclamationCircle,
  IconLogin,
  IconSchool,
  IconUser,
  IconUserPlus,
  IconX,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { authClient } from "../lib/client"; //import the auth client

function PasswordRequirementLabel(
  { check, label }: { check: boolean; label: string },
) {
  return (
    <div className="flex items-center gap-2">
      {check
        ? <IconCheck className="size-5" color="teal" />
        : <IconX className="size-5" color="red" />}
      <span>{label}</span>
    </div>
  );
}

export default function Auth() {
  const navigate = useNavigate();
  let location = useLocation();
  const [selected, setSelected] = useState("login");

  const {
    data: session,
    isPending: loadingSession,
    error: sessionError,
  } = authClient.useSession();

  useEffect(() => {
    if (sessionError) {
      window.alert(
        "An unexpected error occurred checking session. Please try again later.",
      );
    }
    if (!loadingSession && session?.user) {
      navigate("/");
    } else {
      // If session is loading or no user, do nothing
    }
  }, [session, loadingSession, sessionError, navigate]);

  useEffect(() => {
    if (location.pathname === "/login") setSelected("login");
    else setSelected("signup");
  }, [location]);

  const handleNavChange = (value: string) => {
    setSelected(value);
    if (value === "login") navigate("/login");
    else navigate("/signup");
    setErrorMessage("");
  };

  const loginForm = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (
        val: string,
      ) => (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(val)
        ? null
        : "Invalid email"),
      password: (
        val: string,
      ) => (val.length <= 8 && /[0-9]/.test(val) && /[a-z]/.test(val) &&
          /[A-Z]/.test(val) && /[$&+,:;=?@#|'<>.^*()%!-]/.test(val)
        ? "Password does not meet the requirements"
        : null),
    },
  });

  const signupForm = useForm({
    initialValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },

    validate: {
      email: (
        val: string,
      ) => (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(val) &&
          val.length < 256
        ? null
        : "Invalid email entered"),
      password: (
        val: string,
      ) => (val.length >= 8 && /[0-9]/.test(val) && /[a-z]/.test(val) &&
          /[A-Z]/.test(val) && /[$&+,:;=?@#|'<>.^*()%!-]/.test(val)
        ? null
        : "Password does not meet the requirements"),
      confirmPassword: (
        val: string,
        values,
      ):
        | string
        | null => (val === values.password ? null : "Passwords do not match"),
    },
  });

  const passwordRequirements = [
    {
      check: signupForm.values.password.length >= 8,
      label: "At least 8 characters",
    },
    {
      check: /[a-z]/.test(signupForm.values.password),
      label: "Has a lowercase character",
    },
    {
      check: /[A-Z]/.test(signupForm.values.password),
      label: "Has an uppercase character",
    },
    { check: /[0-9]/.test(signupForm.values.password), label: "Has a number" },
    {
      check: /[$&+,:;=?@#|'<>.^*()%!-]/.test(signupForm.values.password),
      label: "Has a special character",
    },
  ];

  const setName = (email: string) => {
    if (/^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(email)) {
      if (/^\d+$/.test(email.split("@")[0].split(".").join(" ").slice(-1))) {
        signupForm.setFieldValue(
          "name",
          email.split("@")[0].split(".").map((e) =>
            e.charAt(0).toUpperCase() + e.slice(1)
          ).join(" ").slice(0, -1),
        );
      } else {
        signupForm.setFieldValue(
          "name",
          email.split("@")[0].split(".").map((e) =>
            e.charAt(0).toUpperCase() + e.slice(1)
          ).join(" "),
        );
      }
    } else if (email === "") signupForm.setFieldValue("name", "");
    else signupForm.setFieldValue("name", "Invalid Email Entered");
  };

  const setAvatar = (name: string) => {
    if (name === "") {
      return <Avatar color="gray" size={30}>?</Avatar>;
    } else if (name === "Invalid Email Entered") {
      return <Avatar color="red" size={30}>ERR</Avatar>;
    } else {
      return (
        <Avatar color="cyan" size={30}>
          {name.split(" ").map((word) => word.charAt(0).toUpperCase())}
        </Avatar>
      );
    }
  };

  interface signupUser {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
  }

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const signupUser = async (values: signupUser) => {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
      callbackURL: "/",
    });

    setLoading(false);
    if (error) {
      console.error(error.message);
      setErrorMessage(error.message || "Signup failed. Please try again.");
    } else if (data) {
      console.log("Signup successful:", data);
    }
  };

  const loginUser = async (values: { email: string; password: string }) => {
    setLoading(true);
    setErrorMessage("");
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    setLoading(false);
    if (error) {
      console.error(error.message);
      setErrorMessage(
        error.message || "Login failed. Please check your credentials.",
      );
    } else if (data) {
      console.log("Login successful:", data);
      navigate("/");
    }
  };

  if (loadingSession) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-row max-h-screen">
      <div className="w-2/5">
        <div className="h-full w-full flex flex-col justify-center items-center p-16 overflow-y-scroll my-auto">
          <div
            className={`text-5xl font-bold w-full ${
              location.pathname === "/login" ? "pt-4" : "pt-20"
            }`}
          >
            <h1 style={{ fontSize: "3rem" }}>
              Welcome to <br />
              <span className="flex justify-center items-center mt-4">
                <Logo size={48} /> LearnLog
              </span>
            </h1>
          </div>
          <div className="w-full">
            <SegmentedControl
              fullWidth
              size="md"
              value={selected}
              onChange={(e) => handleNavChange(e)}
              data={[
                {
                  value: "login",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconLogin className="size-4" />
                      <span>Login</span>
                    </Center>
                  ),
                },
                {
                  value: "signup",
                  label: (
                    <Center style={{ gap: 10 }}>
                      <IconUserPlus className="size-4" />
                      <span>Signup</span>
                    </Center>
                  ),
                },
              ]}
            />
          </div>
          {selected === "login"
            ? (
              <form
                className="w-full text-left py-4"
                onSubmit={loginForm.onSubmit((values) => loginUser(values))}
              >
                <Stack>
                  {errorMessage && (
                    <Alert
                      variant="light"
                      title="Error"
                      color="red"
                      icon={<IconExclamationCircle />}
                    >
                      {errorMessage}
                    </Alert>
                  )}

                  <TextInput
                    required
                    size="md"
                    mt="md"
                    {...loginForm.getInputProps("email")}
                    error={loginForm.errors.email}
                    rightSectionPointerEvents="none"
                    rightSection={<IconUser className="size-5" />}
                    label="Email"
                    placeholder="Your email"
                  />
                  <PasswordInput
                    required
                    {...loginForm.getInputProps("password")}
                    error={loginForm.errors.password}
                    size="md"
                    label="Password"
                    placeholder="Enter your password"
                  />

                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    variant="filled"
                    color="#357c99"
                    loading={loading}
                  >
                    Sign in
                  </Button>
                </Stack>
              </form>
            )
            : (
              <form
                className="w-full text-left py-4"
                onSubmit={signupForm.onSubmit((values) => signupUser(values))}
              >
                <Stack>
                  {errorMessage && (
                    <Alert
                      variant="light"
                      title="Error"
                      color="red"
                      icon={<IconExclamationCircle />}
                    >
                      {errorMessage}
                    </Alert>
                  )}
                  <TextInput
                    required
                    size="md"
                    mt="md"
                    {...signupForm.getInputProps("email")}
                    onChange={(event) => {
                      const emailValue = event.currentTarget.value.trim();
                      signupForm.setFieldValue("email", emailValue);
                      setName(emailValue);
                    }}
                    error={signupForm.errors.email}
                    rightSectionPointerEvents="none"
                    rightSection={<IconSchool className="size-5" />}
                    label="School Email"
                    placeholder="Your email"
                  />
                  <TextInput
                    required
                    size="md"
                    {...signupForm.getInputProps("name")}
                    readOnly
                    rightSection={setAvatar(signupForm.values.name.trim())}
                    label="Your Name"
                    description="This field is auto-filled based on your email."
                    placeholder="Your name"
                  />
                  <PasswordInput
                    required
                    {...signupForm.getInputProps("password")}
                    error={signupForm.errors.password}
                    size="md"
                    label="Password"
                    placeholder="Enter your password"
                  />

                  <div className="flex flex-col gap-1">
                    {passwordRequirements.map((req) => (
                      <PasswordRequirementLabel
                        key={req.label}
                        check={req.check}
                        label={req.label}
                      />
                    ))}
                  </div>

                  <PasswordInput
                    required
                    {...signupForm.getInputProps("confirmPassword")}
                    error={signupForm.errors.confirmPassword}
                    size="md"
                    label="Confirm Password"
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="submit"
                    fullWidth
                    size="md"
                    variant="filled"
                    color="#357c99"
                    loading={loading}
                  >
                    Sign up
                  </Button>
                </Stack>
              </form>
            )}
        </div>
      </div>

      <div className="w-3/5 overflow-hidden">
        <img
          src="/pawel-czerwinski-rRJmwU2R1Kk-unsplash.jpg"
          loading="eager"
          alt="abstract green 3D render"
          className="object-cover w-full"
        />
      </div>
    </div>
  );
}
