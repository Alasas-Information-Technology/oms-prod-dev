import { BudgetSupplementTable } from "@/components/oms/budget-supply-table"; 
import { SimpleKpiCard } from "@/components/oms/simple-kpi";
import { BudgetSupplementTrend } from "@/components/oms/budget-supply-linechart";
export default function  BudgetSupply(){
    return(
        <div>
            <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:account-balance-wallet-outline" value={5000000} title="Annual Budget" description="FY 2026" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:payments-outline" value={3500000} title="Allocated Budget" description="Assigned to departments" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:contract-outline" value={2100000} title="Committed Budget" description="Approved requests" />
                <SimpleKpiCard className="h-[128px]" icon="material-symbols:savings-outline" value={1400000} title="Available Budget" description="Remaining balance" />
                <div className="md:col-span-4">
                    <BudgetSupplementTrend/>
                </div>
                <div className="md:col-span-4">
                    <BudgetSupplementTable/>
        
                </div>
            </div>
        </div>
    )
}