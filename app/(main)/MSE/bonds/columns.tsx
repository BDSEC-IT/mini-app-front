"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
// Define the Bond type based on your data
export interface Bond {
  pkId: number;
  id: number;
  Symbol: string;
  BondmnName: string;
  BondenName: string;
  Issuer: string;
  IssuerEn: string;
  Interest: string;
  Date: string;
  NominalValue: number;
  mnInterestConditions: string;
  enInterestConditions: string;
  MoreInfo: string;
  updatedAt: string;
  TradedDate: string;
  RefundDate: string;
  Isdollar: boolean | null;
  createdAt: string;
  BondName: string;
}
interface ColumnWrapperProps {
  children: (t: any) => JSX.Element;
}
const ColumnWrapper = ({ children }: ColumnWrapperProps) => {
  const t = useTranslations("mseBondTable");
  return <>{children(t)}</>;
};
// Define columns for the bond data
export const columns: ColumnDef<Bond>[] = [
  {
    accessorKey: "Symbol",
    header: () => (
      <ColumnWrapper>{(t) => <div>{t("symbol")}</div>}</ColumnWrapper>
    ),
  },
  {
    accessorKey: "BondName",
    header: () => (
      <ColumnWrapper>{(t) => <div>{t("bondName")}</div>}</ColumnWrapper>
    ),
  },
  {
    accessorKey: "Issuer",
    header: () => (
      <ColumnWrapper>{(t) => <div>{t("issuer")}</div>}</ColumnWrapper>
    ),
  },
  {
    accessorKey: "NominalValue",
    header: () => (
      <ColumnWrapper>
        {(t) => <div className="text-left">{t("nominalValue")}</div>}
      </ColumnWrapper>
    ),
    cell: ({ row }) => {
      const value = row.getValue<number>("NominalValue");
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "MNT",
      }).format(value);

      return <div className="text-left font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "Interest",
    header: ({ column }) => (
      <ColumnWrapper>
        {(t) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("interest")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )}
      </ColumnWrapper>
    ),
  },
  {
    accessorKey: "TradedDate",
    header: () => (
      <ColumnWrapper>{(t) => <div>{t("tradedDate")}</div>}</ColumnWrapper>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const bond = row.original;

      return (
        <ColumnWrapper>
          {(t) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("actions.actions")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(bond.Symbol)}
                >
                  {t("actions.copySymbol")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a
                    href={bond.MoreInfo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("actions.viewMoreInfo")}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </ColumnWrapper>
      );
    },
  },
];
