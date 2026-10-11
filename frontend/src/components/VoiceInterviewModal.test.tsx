// Runtime validation coverage for verbal answer submission and delivery metrics.
// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import api from "../api/api";
import VoiceInterviewModal from "./VoiceInterviewModal";

vi.mock("../api/api", () => ({
  default: { post: vi.fn().mockResolvedValue({ data: { consumed: true } }) },
}));

const originalMediaDevices = Object.getOwnPropertyDescriptor(navigator, "mediaDevices");

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  if (originalMediaDevices) {
    Object.defineProperty(navigator, "mediaDevices", originalMediaDevices);
  } else {
    Reflect.deleteProperty(navigator, "mediaDevices");
  }
});

describe("VoiceInterviewModal", () => {
  it("displays the question and updates transcript metrics", () => {
    render(
      <VoiceInterviewModal
        questionText="Tell me about a technical challenge."
        onComplete={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("Tell me about a technical challenge.")).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Live transcript/), {
      target: { value: "Um, like this is basically clear. You know?" },
    });

    expect(screen.getByText("8")).toBeTruthy();
    expect(screen.getByText("4")).toBeTruthy();
    expect(screen.getByText("Slow / Deliberate")).toBeTruthy();
  });

  it("submits the transcript with its word, filler, and pace metrics", () => {
    const onComplete = vi.fn();
    render(
      <VoiceInterviewModal
        questionText="Tell me about a technical challenge."
        onComplete={onComplete}
        onClose={vi.fn()}
      />,
    );
    const transcript = "Um, like this is basically clear. You know?";

    fireEvent.change(screen.getByLabelText(/Live transcript/), {
      target: { value: transcript },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit verbal answer" }));

    expect(onComplete).toHaveBeenCalledWith(transcript, {
      wordCount: 8,
      elapsedSeconds: 0,
      wordsPerMinute: 0,
      pace: "slow",
      fillerCounts: {
        um: 1,
        uh: 0,
        like: 1,
        actually: 0,
        basically: 1,
        "you know": 1,
      },
      totalFillers: 4,
    });
  });

  it("authorizes a prepaid minute before starting voice recognition", async () => {
    const recognition = {
      continuous: false,
      interimResults: false,
      lang: "",
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
    };
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "";
      onresult: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onend: (() => void) | null = null;
      start = recognition.start;
      stop = recognition.stop;
      abort = recognition.abort;
    }
    const stopTrack = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] }) },
    });
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    render(
      <VoiceInterviewModal
        questionText="Tell me about a technical challenge."
        onComplete={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start recording" }));

    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/payments/usage", {
      session_id: expect.any(String),
      minute_number: 1,
    }));
    await waitFor(() => expect(recognition.start).toHaveBeenCalledOnce());
    expect(stopTrack).toHaveBeenCalledOnce();

  });
});
