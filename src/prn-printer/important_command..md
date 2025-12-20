Get-ChildItem "d:\marken\backend\src\prn-printer\*.prn" | ForEach-Object { 
    $filename = $_.Name
    Write-Host "`n=== $filename ==="
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    $matches = [regex]::Matches($content, 'V[A-Z][a-zA-Z0-9]*')
    $variables = $matches | ForEach-Object { $_.Value } | Sort-Object -Unique
    $variables -join ', '
}


=== BINOCULAR_MICROSCOPE_60_40.prn ===
VAddress1- prnDetails[0].company_address_1 , VAddress2 - prnDetails[0].company_address_2, VCategoryName- category_name, prnDetails[0].company_name, prnDetails[0].customer_care_no, prnDetails[0].email, VMake- prnDetails[0].make, VModel- model_name, VSerialNo - serial_no(split via $), VSupply ->input_rating

=== BLOOD_BANK_REFRIGERATOR_100_200.prn ===
VAddress1 - prnDetails[0].company_address_1 , VAddress2 -  - prnDetails[0].company_address_2, VCapacity - capacity, VCategoryName - category_name, VCompanyName - prnDetails[0].company_name , VCustCareNo - prnDetails[0].customer_care_no, VEmail -  prnDetails[0].email, VInputRating - input_rating , VMake - prnDetails[0].make, VModel - model_name, VNameOfRefrigerant -name_of_refrigerant , VOperatingTemp - operating_temp, VSerialNo -serial_no(split via $) , VWeightOfMachine - weight_of_machine

=== DEEP_FREEZER_130_80.prn ===
VAddress1 - prnDetails[0].company_address_1 , VAddress2 -  - prnDetails[0].company_address_2, VCapacity - capacity, VCategoryName - category_name, VCompanyName - prnDetails[0].company_name , VCustCareNo - prnDetails[0].customer_care_no, VEmail -  prnDetails[0].email, VInputRating - input_rating , VMake - prnDetails[0].make, VModel - model_name ,VNameOfRefrigerant -name_of_refrigerant , VOperatingTemp - operating_temp, VSerialNo -serial_no(split via $) , VWeightOfMachine - weight_of_machine


=== MULTICHANNEL_PIPETTE_80_40.prn ===
VAddress1 - prnDetails[0].company_address_1 , VAddress2 -  - prnDetails[0].company_address_2 , VCategoryName,  VCompanyName - prnDetails[0].company_name ,  VCustCareNo - prnDetails[0].customer_care_no,  VEmail -  prnDetails[0].email,  VMake - prnDetails[0].make, VModel - model_name, VSerialNo - serial_no(split via $)

=== SERVO_CONTROLLED_VOLTAGE_STABILIZER_100_60.prn ===
VCapacity - capacity, VCategoryName - category_name, VCompanyName - prnDetails[0].company_name VModel- model_name, VSerialNo - serial_no(split via $), VOutputVolt - output_volt, VVoltMax - "", VVoltMin -""