import { render, screen } from "@testing-library/react";
import OptionChainMatrix from "./OptionChainMatrix";

describe("OptionChainMatrix", () => {

    test("renders the option chain", () => {

        render(
            <OptionChainMatrix
                atmStrike={18000}
                strikeCount={2}
                strikeDistance={50}
                onAction={() => { }}
            />
        );

        expect(
            screen.getByText("STRIKE")
        ).toBeInTheDocument();

        expect(
            screen.getByText("CALLS")
        ).toBeInTheDocument();

        expect(
            screen.getByText("PUTS")
        ).toBeInTheDocument();

    });
    test("renders the correct strike prices", () => {

        render(
            <OptionChainMatrix
                atmStrike={18000}
                strikeCount={2}
                strikeDistance={50}
                onAction={() => { }}
            />
        );

        expect(screen.getByText("17,900")).toBeInTheDocument();
        expect(screen.getByText("17,950")).toBeInTheDocument();
        expect(screen.getByText("18,000")).toBeInTheDocument();
        expect(screen.getByText("18,050")).toBeInTheDocument();
        expect(screen.getByText("18,100")).toBeInTheDocument();

    });
    test("renders the correct number of rows", () => {

        const { container } = render(
            <OptionChainMatrix
                atmStrike={18000}
                strikeCount={2}
                strikeDistance={50}
                onAction={() => { }}
            />
        );

        const rows = container.querySelectorAll(".option-row");

        expect(rows).toHaveLength(5);

    });

    test("highlights the ATM row", () => {

        const { container } = render(
            <OptionChainMatrix
                atmStrike={18000}
                strikeCount={2}
                strikeDistance={50}
                onAction={() => { }}
            />
        );

        const atmRow = container.querySelector(".atm-row");

        expect(atmRow).toBeInTheDocument();

        expect(
            atmRow.querySelector(".strike-price")
        ).toHaveTextContent("18,000");

    });

});