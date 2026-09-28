const fs = require('fs');
const path = 'components/organization/OrgUnitDetailView.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnStartIdx = content.indexOf('  return (', content.indexOf('const effectiveHeadSince ='));
const returnEndIdx = content.lastIndexOf('  );');

if (returnStartIdx === -1 || returnEndIdx === -1) {
  console.error("Could not find bounds");
  process.exit(1);
}

const replacement = `  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* HEADER SECTION */}
      <div className="px-6 sm:px-8 pt-8 pb-6 bg-linear-to-b from-primary/5 via-background to-background border-b border-border/60 shrink-0">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 select-none">
              {typeName}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground border border-border/60 bg-muted/40 px-2 py-0.5 rounded-md select-none">
              {unit.code}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {can(ORG_PERMISSIONS.UPDATE) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                className="gap-1.5 text-xs h-8 px-3 rounded-md shadow-xs bg-card border-border/60 hover:bg-muted"
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-md shadow-xs bg-card border-border/60 hover:bg-muted"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1">
                {can(ORG_PERMISSIONS.MOVE) && (
                  <DropdownMenuItem
                    onClick={() => setIsMoveOpen(true)}
                    className="gap-2 text-xs cursor-pointer rounded-sm"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
                    <span>Move {typeName.toLowerCase()}</span>
                  </DropdownMenuItem>
                )}
                {can(ORG_PERMISSIONS.UPDATE) && (
                  <DropdownMenuItem
                    onClick={() => setIsArchiveOpen(true)}
                    className="gap-2 text-xs cursor-pointer rounded-sm"
                  >
                    <Archive className="h-3.5 w-3.5 text-amber-600" />
                    <span>{unit.isActive ? \`Archive \${typeName.toLowerCase()}\` : \`Restore \${typeName.toLowerCase()}\`}</span>
                  </DropdownMenuItem>
                )}
                {can(ORG_PERMISSIONS.DELETE) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setIsDeleteOpen(true)}
                      className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer rounded-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove {typeName.toLowerCase()}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-card border border-border/60 shadow-xs flex items-center justify-center shrink-0 mt-0.5 text-primary">
            <OrgTypeIcon type={typeCode || "DEPARTMENT"} size="detail" className="shrink-0" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
              {unit.name}
            </h1>
            {unit.nameAr && (
              <p dir="rtl" lang="ar" className="text-sm text-muted-foreground font-arabic mt-1">
                {unit.nameAr}
              </p>
            )}

            <div className="mt-2.5 text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground/70">Part of</span>
              {breadcrumbItems.length > 0 ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {breadcrumbItems.map((item, idx) => (
                    <React.Fragment key={item.orgUnitId || idx}>
                      {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
                      <button
                        type="button"
                        onClick={() => item.orgUnitId && onNavigateUnit?.(item.orgUnitId)}
                        className="font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-medium text-foreground">DIEZ</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/40">
                    Top level
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS SECTION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-6 sm:px-8 border-b border-border/60 bg-background/95 backdrop-blur-xs sticky top-0 z-10 shrink-0">
          <TabsList className="h-14 w-full p-0 bg-transparent flex items-center justify-start gap-6 border-none">
            {["overview", "children", "people", "history"].map((tab) => {
              const labels: Record<string, string> = {
                overview: "Overview",
                children: childMeta.tabLabel,
                people: "People",
                history: "History",
              };
              const counts: Record<string, number | undefined> = {
                children: childrenList?.length,
                people: (unit as any).peopleCount ?? (unit as any).assignedUserCount,
                history: changeLogsData?.total,
              };
              
              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="h-14 px-0 bg-transparent rounded-none text-[13px] font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-none data-[state=active]:bg-transparent relative transition-colors after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-transparent data-[state=active]:after:bg-primary"
                >
                  {labels[tab]}
                  {counts[tab] ? (
                    <Badge variant="secondary" className="ml-2 text-[10px] font-bold px-1.5 py-0 h-4 bg-muted/60 text-muted-foreground">
                      {counts[tab]}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-6 sm:p-8">
          
          <TabsContent value="overview" className="m-0 focus-visible:outline-none space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              
              {/* Left Column */}
              <div className="space-y-6 min-w-0">
                {/* Details Card */}
                <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Core Information
                    </h3>
                  </div>
                  <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
                      <div className="flex items-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-semibold border",
                            unit.isActive
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                              : "bg-muted text-muted-foreground border-border/50"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full mr-1.5",
                              unit.isActive ? "bg-emerald-500" : "bg-muted-foreground"
                            )}
                          />
                          {unit.isActive ? "Active" : "Archived"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">What's Inside</p>
                      <p className="text-sm font-medium text-foreground">{countSentence}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Cost Centre</p>
                      <p className="text-sm font-medium text-foreground">{unit.costCenterCode || "None"}</p>
                    </div>
                  </div>
                </div>

                {/* Who's in charge Card */}
                <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Leadership
                    </h3>
                  </div>
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold border border-primary/20 shrink-0">
                      {isHeadAssigned ? (
                        <span>{getInitials(headName)}</span>
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {isHeadAssigned ? (
                        <div>
                          <p className="text-base font-bold text-foreground leading-snug">
                            {headName}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            Head · Appointed {formatDisplayDate(effectiveHeadSince)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-base font-bold text-foreground leading-snug">
                            No active leader
                          </p>
                          {can(ORG_PERMISSIONS.MANAGE_MANAGERS) && (
                            <button
                              type="button"
                              onClick={() => setActiveTab("people")}
                              className="text-xs font-semibold text-primary hover:underline mt-1"
                            >
                              Assign manager
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6 min-w-0">
                {/* Budget held by Card */}
                <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Budget Owner
                    </h3>
                  </div>
                  <div className="p-5">
                    {isLoadingBudget ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span>Checking...</span>
                      </div>
                    ) : budgetOwner ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">{budgetOwner.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {budgetOwner.code}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Not assigned</p>
                        {can(ORG_PERMISSIONS.UPDATE) && (
                          <button
                            type="button"
                            onClick={() => setIsEditOpen(true)}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Set budget owner
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sign-off chain */}
                <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sign-Off Chain
                    </h3>
                  </div>
                  <div className="p-5">
                    {isLoadingChain ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span>Loading path...</span>
                      </div>
                    ) : approvalChain && approvalChain.length > 0 ? (
                      <div className="relative">
                        {approvalChain.map((node, idx) => {
                          const isLast = idx === approvalChain.length - 1;
                          const headPerson = node.head?.displayName;
                          const hasHead = Boolean(headPerson && headPerson !== "Assigned Head");

                          return (
                            <div key={node.orgUnitId || idx} className="relative flex items-start gap-3 pb-5 last:pb-0">
                              {!isLast && (
                                <div className="absolute left-[11px] top-[24px] bottom-0 w-[2px] bg-border/60 rounded-full" />
                              )}
                              <div className="relative z-10 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center shrink-0">
                                <div className={cn("w-2 h-2 rounded-full", hasHead ? "bg-primary" : "bg-muted-foreground")} />
                              </div>
                              <div className="min-w-0 flex-1 -mt-0.5">
                                <p className="text-sm font-bold text-foreground leading-snug truncate">
                                  {node.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5 leading-snug truncate font-medium">
                                  {hasHead ? headPerson : "No one in charge"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No sign-off route required.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="children" className="m-0 focus-visible:outline-none">
            <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border/40 flex items-center justify-between gap-4 bg-muted/10">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{childMeta.tabLabel}</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Teams and divisions inside {unit.name}.
                  </p>
                </div>
                {can(ORG_PERMISSIONS.CREATE) && (
                  <Button
                    size="sm"
                    onClick={() => setIsAddChildOpen(true)}
                    className="gap-1.5 text-xs h-8 shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add {childMeta.singularLabel.toLowerCase()}
                  </Button>
                )}
              </div>
              <div className="p-0">
                <DataTable
                  columns={childrenColumns}
                  data={childrenList || []}
                  keyField="orgUnitId"
                  loading={isLoadingChildren}
                  onRowClick={(row) => onNavigateUnit?.(row.orgUnitId)}
                  emptyMessage={\`No \${childMeta.tabLabel.toLowerCase()} added under \${unit.name} yet.\`}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="people" className="m-0 focus-visible:outline-none">
            <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
              <ManagerAssignmentPanel orgUnitId={unit.orgUnitId} unitName={unit.name} />
            </div>
          </TabsContent>

          <TabsContent value="history" className="m-0 focus-visible:outline-none">
            <div className="bg-card border border-border/60 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-border/40 bg-muted/10">
                <h3 className="text-sm font-bold text-foreground">Change Log</h3>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Plain-language record of reporting changes, appointments, and structure updates.
                </p>
              </div>
              <div className="p-5">
                {isLoadingLogs ? (
                  <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 text-xs font-medium text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading history records...</span>
                  </div>
                ) : changeLogsData?.data && changeLogsData.data.length > 0 ? (
                  <div className="space-y-4 divide-y divide-border/50">
                    {changeLogsData.data.map((log) => {
                      const isMove = log.changeType === "MOVED" || log.changeType === "REPARENT";
                      const oldParent = log.oldValues?.parentName || log.oldValues?.parentOrgUnitId || "DIEZ";
                      const newParent = log.newValues?.parentName || log.newValues?.parentOrgUnitId || "DIEZ";
                      const operator = log.performedByDisplayName || log.performedBy || "Administrator";
                      const formattedDate = log.performedAt
                        ? new Date(log.performedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Recently";

                      let sentence = \`\${unit.name} updated — \${operator}, \${formattedDate}\`;
                      if (isMove) {
                        sentence = \`Moved from \${oldParent} to \${newParent} — \${operator}, \${formattedDate}\`;
                      } else if (log.changeType === "MANAGER_ASSIGNED") {
                        sentence = \`Assigned leader — \${operator}, \${formattedDate}\`;
                      } else if (log.changeType === "CREATED") {
                        sentence = \`Created under \${newParent} — \${operator}, \${formattedDate}\`;
                      } else if (log.changeType === "DEACTIVATED") {
                        sentence = \`Archived — \${operator}, \${formattedDate}\`;
                      } else if (log.changeType === "ACTIVATED") {
                        sentence = \`Restored — \${operator}, \${formattedDate}\`;
                      }

                      const friendlyTag =
                        isMove ? "Move" :
                        log.changeType === "CREATED" ? "Created" :
                        log.changeType === "DEACTIVATED" ? "Archived" :
                        log.changeType === "ACTIVATED" ? "Restored" :
                        log.changeType === "MANAGER_ASSIGNED" ? "Leadership" : "Update";

                      return (
                        <div key={log.changeLogId} className="pt-4 first:pt-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[13px] font-bold text-foreground leading-snug">
                              {sentence}
                            </p>
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-muted/60 border border-border/50">
                              {friendlyTag}
                            </Badge>
                          </div>
                          {isMove && log.affectedNodeCount !== undefined && log.affectedNodeCount > 0 && (
                            <p className="text-xs font-medium text-muted-foreground">
                              {log.affectedNodeCount} teams inside moved with it.
                            </p>
                          )}
                          {log.reason && (
                            <p className="text-xs font-medium text-muted-foreground">
                              Reason: {log.reason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-medium text-muted-foreground">
                    No history records logged for this {typeName.toLowerCase()} yet.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* ========================================================================= */}
      {/* Dialogs: Edit, Add, Move, Remove                                         */}
      {/* ========================================================================= */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit {typeName}</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Update properties for <span className="font-bold text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <OrgUnitForm
            initialData={unit}
            onSubmit={handleUpdateSubmit}
            onCancel={() => setIsEditOpen(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddChildOpen} onOpenChange={setIsAddChildOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add {childMeta.singularLabel}</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Add a new {childMeta.singularLabel.toLowerCase()} under{" "}
              <span className="font-bold text-foreground">{unit.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <AddOrgUnitWizard
            initialParent={unit}
            targetTypeId={childMeta.targetTypeId}
            onSubmit={handleAddChildSubmit}
            onCancel={() => setIsAddChildOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <MoveUnitDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      <ArchiveUnitDialog
        open={isArchiveOpen}
        onOpenChange={setIsArchiveOpen}
        unit={unit}
        onSuccess={() => refetchUnit()}
      />

      <DeleteUnitDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        unit={unit}
        onNavigateToTab={(tab) => setActiveTab(tab)}
        onOpenMove={() => setIsMoveOpen(true)}
        onSuccess={() => {
          if (onNavigateUnit) {
            onNavigateUnit("");
          } else {
            router.push("/app/administration/master-data/organization");
          }
        }}
      />
    </div>
  );`;

const newContent = content.substring(0, returnStartIdx) + replacement + "\n}\n";
fs.writeFileSync(path, newContent);
console.log('Successfully updated OrgUnitDetailView.tsx');
