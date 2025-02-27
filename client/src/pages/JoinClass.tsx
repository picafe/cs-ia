import { Alert, Button, Group, Loader, TextInput } from "@mantine/core";
import { useField } from "@mantine/form";
import axios from "axios";
import { useState } from "react";
import Logo from "../icons/Logo";
import { IconExclamationCircle } from "@tabler/icons-react";

export default function JoinClass() {
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const code = useField({
    initialValue: "",
    validate: (
      value,
    ) => (value.trim().length < 2 ? "Value is too short" : null),
  });
  const joinClass = async () => {
    setLoading(true);
    try {
      const res = await axios.post(serverUrl + "/class/join", code, {
        withCredentials: true,
      });
    } catch (err) {
      let errorMessage: string;
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data;
      } else {
        errorMessage = "Something unexpected happened! Please contact support.";
      }
      setErrorMessage("Login failed: " + errorMessage);
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
          <h1>Join a Class</h1>
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
            {...code.getInputProps()}
            required
            variant="filled"
            label="Course Code"
            size="lg"
            placeholder="abc123"
          />
          <Group justify="flex-end" mt="md">
            <Button size="md" onClick={() => joinClass()}>
              {loading ? <Loader /> : "Join 🚀"}
            </Button>
          </Group>
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
