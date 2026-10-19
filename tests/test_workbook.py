import re
import unittest
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile


FILE = Path(__file__).resolve().parents[1] / "assets" / "FY27-Q2-QC-Details-Fictitious.xlsx"
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}


class DemoWorkbookTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with ZipFile(FILE) as package:
            cls.parts = {name: package.read(name) for name in package.namelist()}
        strings = []
        if "xl/sharedStrings.xml" in cls.parts:
            strings = [
                "".join(node.itertext())
                for node in ET.fromstring(cls.parts["xl/sharedStrings.xml"]).findall("m:si", NS)
            ]
        cls.sheet = ET.fromstring(cls.parts["xl/worksheets/sheet1.xml"])
        cls.rows = []
        for row in cls.sheet.findall("m:sheetData/m:row", NS):
            values = {}
            for cell in row.findall("m:c", NS):
                value = cell.find("m:v", NS)
                inline = cell.find("m:is", NS)
                text = value.text if value is not None else "".join(inline.itertext()) if inline is not None else ""
                if cell.get("t") == "s":
                    text = strings[int(text)]
                values[re.sub(r"\d", "", cell.get("r"))] = text
            cls.rows.append(values)
        cls.header, cls.data = cls.rows[0], cls.rows[1:]

    def test_table_and_synthetic_identities(self):
        self.assertEqual(len(self.data), 50)
        self.assertEqual(len(self.header), 41)
        self.assertEqual(self.header["X"], "Leader Insight : Manager")
        self.assertEqual(self.header["AJ"], "Length of Service")
        self.assertEqual(self.header["AK"], "Time in Position")
        table = ET.fromstring(self.parts["xl/tables/table1.xml"])
        self.assertEqual((table.get("name"), table.get("ref")), ("QC_Details", "A1:AO51"))
        for index, row in enumerate(self.data, 1):
            self.assertEqual(row["A"], f"Employee {index:02d} (DEMO-{index:03d})")
            self.assertRegex(row["AB"], r"^Demo Executive \d{2}$")
            for column, prefix in [("I", "Demo Officer"), ("AD", "Demo Location"), ("AE", "DEMO-LOC"), ("AF", "DEMO-MARKET"), ("AG", "DEMO-AREA"), ("AI", "Demo Cost Center"), ("AL", "Demo Grade"), ("AO", "Demo Job")]:
                self.assertTrue(not row.get(column) or row[column].startswith(prefix), column)
        self.assertEqual(len(self.sheet.findall(".//m:f", NS)), 0)
        self.assertEqual([cell.get("r") for cell in self.sheet.findall(".//m:c", NS) if cell.get("t") == "e"], [])

    def test_benchmarks_and_missing_response_definition(self):
        expected = {"Manager 1": (30, 1, 28, 9), "Manager 2": (20, 11, 16, 7)}
        for manager, (size, no_dev, complete, unanswered) in expected.items():
            group = [row for row in self.data if row["H"] == manager]
            self.assertEqual(len(group), size)
            self.assertEqual(sum(row["S"] == "No" for row in group), no_dev)
            self.assertEqual(sum(row["F"] == "Successfully Completed" for row in group), complete)
            self.assertEqual(sum(bool(row.get("V", "").strip()) and not row.get("W", "").strip() for row in group), unanswered)
        manager_two = [row for row in self.data if row["H"] == "Manager 2"]
        self.assertEqual(Counter(row["F"] for row in manager_two), {
            "Successfully Completed": 16,
            "Manually Advanced (Employee did not submit QC to manager)": 2,
            "Manually Advanced (Employee did submit QC to manager, but manager did not submit insights)": 1,
            "Awaiting Manager Completion (Employee submitted QC to manager, awaiting manager insights)": 1,
        })
        self.assertEqual(sum(row["AK"] in ("0-3 Months", "3-6 Months", "6-12 Months") for row in manager_two), 15)
        self.assertEqual(Counter(row["D"] for row in self.data), {"2027": 50})
        self.assertEqual(Counter(row["E"] for row in self.data), {"Q2": 50})
        self.assertEqual({row["B"] for row in self.data}, {"46145"})
        self.assertEqual({row["C"] for row in self.data}, {"46235"})
        for column in ("L", "M", "P", "Q"):
            self.assertLessEqual({row.get(column, "") for row in self.data}, {"Leading", "On-track", "Off-track", ""})

    def test_customer_neutral_package(self):
        for name in self.parts:
            self.assertFalse(any(token in name.lower() for token in ("docmetadata", "externallink", "customxml", "vbaproject", "comments")))
        xml = "\n".join(value.decode("utf-8") for name, value in self.parts.items() if name.endswith((".xml", ".rels")))
        self.assertNotRegex(xml, r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}")
        self.assertNotRegex(xml, r"membership\||siteId=|labelList|revisionPtr|TargetMode=\"External\"")
        core = ET.fromstring(self.parts["docProps/core.xml"])
        ns = {"dc": "http://purl.org/dc/elements/1.1/", "cp": "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"}
        self.assertEqual(core.find("dc:creator", ns).text, "Synthetic Training")
        self.assertEqual(core.find("cp:lastModifiedBy", ns).text, "Synthetic Training")
        self.assertIn("Fictitious Data", core.find("dc:title", ns).text)


if __name__ == "__main__":
    unittest.main()
