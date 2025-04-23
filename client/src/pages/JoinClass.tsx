import { Alert, Button, Group, Loader, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Logo from "../icons/Logo";
import { IconExclamationCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { client } from "../lib/client";
import type { InferRequestType, InferResponseType } from 'hono/client';

type JoinClassFormValues = InferRequestType<typeof client.class.join.$post>['json'];

export default function JoinClass() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<JoinClassFormValues>({
    initialValues: {
      code: "",
    },
    validate: {
      code: (value) => (value.trim().length === 6 ? null : "Class code must be 6 characters"),
    },
  });

  const joinClass = async (values: JoinClassFormValues) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await client.class.join.$post({ json: values });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        navigate("/");
      } else {
        throw new Error(data.error || "Failed to join class");
      }
    } catch (err: any) {
      console.error("Join class error:", err);
      setErrorMessage(err.message || "Something unexpected happened! Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row max-h-screen">
      <div className="w-2/5">
        <div className="h-full w-full flex flex-col justify-center p-16 overflow-y-scroll">
          <div className="flex justify-center text-5xl font-bold w-full">
            <h1 style={{ fontSize: "3rem" }}>
              Welcome to <br />
              <span className="flex justify-center items-center mt-4">
                <Logo size={48} /> LearnLog
              </span>
            </h1>
          </div>
          <h1 className="text-3xl font-semibold mt-8 mb-4 text-center">Join a Class</h1>
          {errorMessage && (
            <Alert
              variant="light"
              title="Error"
              color="red"
              icon={<IconExclamationCircle />}
              mb="md"
              withCloseButton
              onClose={() => setErrorMessage("")}
            >
              {errorMessage}
            </Alert>
          )}
          <form onSubmit={form.onSubmit(joinClass)}>
            <Stack>
              <TextInput
                {...form.getInputProps("code")}
                required
                variant="filled"
                label="Class Code"
                size="lg"
                placeholder="Enter 6-character code"
                maxLength={6}
              />
              <Button type="submit" size="lg" loading={loading} fullWidth>
                {loading ? "Joining..." : "Join Class"}
              </Button>
            </Stack>
          </form>
        </div>
      </div>
      <div className="w-3/5 overflow-hidden">
        <img
          src="/pawel-czerwinski-rRJmwU2R1Kk-unsplash.jpg"
          loading="eager"
          alt="abstract green 3D render"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
